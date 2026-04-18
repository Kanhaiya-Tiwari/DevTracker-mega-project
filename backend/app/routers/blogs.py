from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
from uuid import UUID

from app.dependencies import get_db, get_current_user
from app.models.blog import Blog
from app.models.user import User

router = APIRouter()


class BlogCreate(BaseModel):
    title: str
    content: str
    cover_image: Optional[str] = None


class BlogUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    cover_image: Optional[str] = None


class BlogResponse(BaseModel):
    id: str
    user_id: str
    title: str
    content: str
    cover_image: Optional[str]
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True

    @classmethod
    def from_orm(cls, obj):
        return cls(
            id=str(obj.id),
            user_id=str(obj.user_id),
            title=obj.title,
            content=obj.content,
            cover_image=obj.cover_image,
            created_at=obj.created_at.isoformat() if obj.created_at else None,
            updated_at=obj.updated_at.isoformat() if obj.updated_at else None
        )


@router.get("/", response_model=list[BlogResponse])
async def get_blogs(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Blog)
        .where(Blog.user_id == current_user.id)
        .order_by(Blog.created_at.desc())
    )
    blogs = result.scalars().all()
    return [BlogResponse.from_orm(blog) for blog in blogs]


@router.post("/", response_model=BlogResponse)
async def create_blog(
    blog: BlogCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_blog = Blog(
        user_id=current_user.id,
        title=blog.title,
        content=blog.content,
        cover_image=blog.cover_image
    )
    db.add(new_blog)
    await db.commit()
    await db.refresh(new_blog)
    return BlogResponse.from_orm(new_blog)


@router.get("/{blog_id}", response_model=BlogResponse)
async def get_blog(
    blog_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Blog)
        .where(Blog.id == UUID(blog_id), Blog.user_id == current_user.id)
    )
    blog = result.scalar_one_or_none()
    if not blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog not found"
        )
    return BlogResponse.from_orm(blog)


@router.put("/{blog_id}", response_model=BlogResponse)
async def update_blog(
    blog_id: str,
    blog_update: BlogUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Blog)
        .where(Blog.id == UUID(blog_id), Blog.user_id == current_user.id)
    )
    blog = result.scalar_one_or_none()
    if not blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog not found"
        )

    if blog_update.title is not None:
        blog.title = blog_update.title
    if blog_update.content is not None:
        blog.content = blog_update.content
    if blog_update.cover_image is not None:
        blog.cover_image = blog_update.cover_image

    await db.commit()
    await db.refresh(blog)
    return BlogResponse.from_orm(blog)


@router.delete("/{blog_id}")
async def delete_blog(
    blog_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Blog)
        .where(Blog.id == UUID(blog_id), Blog.user_id == current_user.id)
    )
    blog = result.scalar_one_or_none()
    if not blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog not found"
        )

    await db.delete(blog)
    await db.commit()
    return {"message": "Blog deleted successfully"}
