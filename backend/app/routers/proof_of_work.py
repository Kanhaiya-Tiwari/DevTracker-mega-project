from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
from uuid import UUID
import os
import shutil
from datetime import datetime

from app.dependencies import get_db, get_current_user
from app.models.proof_of_work import ProofOfWork
from app.models.skill import Skill
from app.models.user import User

router = APIRouter()

# Create uploads directory if it doesn't exist
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


class ProofOfWorkCreate(BaseModel):
    skill_id: str
    log_id: Optional[str] = None
    notes: Optional[str] = None


class ProofOfWorkResponse(BaseModel):
    id: str
    log_id: str
    skill_id: Optional[str]
    user_id: str
    file_url: str
    file_name: str
    file_type: str
    file_size: str
    notes: Optional[str]
    created_at: str

    class Config:
        from_attributes = True

    @classmethod
    def from_orm(cls, obj):
        return cls(
            id=str(obj.id),
            log_id=str(obj.log_id),
            skill_id=str(obj.skill_id) if obj.skill_id else None,
            user_id=str(obj.user_id),
            file_url=obj.file_url,
            file_name=obj.file_name,
            file_type=obj.file_type,
            file_size=obj.file_size,
            notes=obj.notes,
            created_at=obj.created_at.isoformat() if obj.created_at else None
        )


@router.post("/upload", response_model=ProofOfWorkResponse)
async def upload_proof_of_work(
    log_id: str,
    file: UploadFile = File(...),
    notes: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload proof of work for a session (log)"""
    # Validate log belongs to user
    from app.models.log import Log
    log_result = await db.execute(
        select(Log).where(Log.id == UUID(log_id), Log.user_id == current_user.id)
    )
    log = log_result.scalar_one_or_none()
    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )

    # Save file
    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{current_user.id}_{log_id}_{datetime.utcnow().timestamp()}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {str(e)}"
        )

    # Create proof of work record
    proof = ProofOfWork(
        log_id=UUID(log_id),
        user_id=current_user.id,
        skill_id=log.skill_id,
        file_url=f"/uploads/{unique_filename}",
        file_name=file.filename,
        file_type=file.content_type,
        file_size=f"{file.size / 1024:.1f} KB",
        notes=notes
    )

    db.add(proof)
    await db.commit()
    await db.refresh(proof)

    return ProofOfWorkResponse.from_orm(proof)


@router.get("/log/{log_id}", response_model=list[ProofOfWorkResponse])
async def get_proof_by_log(
    log_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all proof of work for a session (log)"""
    result = await db.execute(
        select(ProofOfWork)
        .where(ProofOfWork.log_id == UUID(log_id), ProofOfWork.user_id == current_user.id)
        .order_by(ProofOfWork.created_at.desc())
    )
    proofs = result.scalars().all()
    return [ProofOfWorkResponse.from_orm(proof) for proof in proofs]


@router.get("/skill/{skill_id}", response_model=list[ProofOfWorkResponse])
async def get_proof_by_skill(
    skill_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all proof of work for a skill (through logs)"""
    result = await db.execute(
        select(ProofOfWork)
        .join(Log, ProofOfWork.log_id == Log.id)
        .where(Log.skill_id == UUID(skill_id), ProofOfWork.user_id == current_user.id)
        .order_by(ProofOfWork.created_at.desc())
    )
    proofs = result.scalars().all()
    return [ProofOfWorkResponse.from_orm(proof) for proof in proofs]


@router.get("/user", response_model=list[ProofOfWorkResponse])
async def get_user_proofs(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all proof of work for current user"""
    result = await db.execute(
        select(ProofOfWork)
        .where(ProofOfWork.user_id == current_user.id)
        .order_by(ProofOfWork.created_at.desc())
    )
    proofs = result.scalars().all()
    return [ProofOfWorkResponse.from_orm(proof) for proof in proofs]


@router.get("/{proof_id}", response_model=ProofOfWorkResponse)
async def get_proof(
    proof_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific proof of work"""
    result = await db.execute(
        select(ProofOfWork)
        .where(ProofOfWork.id == UUID(proof_id), ProofOfWork.user_id == current_user.id)
    )
    proof = result.scalar_one_or_none()
    if not proof:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proof of work not found"
        )
    return ProofOfWorkResponse.from_orm(proof)


@router.delete("/{proof_id}")
async def delete_proof(
    proof_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a proof of work"""
    result = await db.execute(
        select(ProofOfWork)
        .where(ProofOfWork.id == UUID(proof_id), ProofOfWork.user_id == current_user.id)
    )
    proof = result.scalar_one_or_none()
    if not proof:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proof of work not found"
        )

    # Delete file
    file_path = proof.file_url.lstrip("/")
    if os.path.exists(file_path):
        os.remove(file_path)

    await db.delete(proof)
    await db.commit()
    return {"message": "Proof of work deleted successfully"}
