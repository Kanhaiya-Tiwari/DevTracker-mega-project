Alembic migration files live in this directory.

Typical workflow:

1. Configure the database URL for the backend environment.
2. Generate a migration after model changes.
3. Review the generated migration before applying it.
4. Apply migrations in local, CI, and deployment environments.

Common commands:

```bash
alembic revision --autogenerate -m "describe change"
alembic upgrade head
alembic downgrade -1
```

Recommended next additions for this folder:

- `env.py`
- `script.py.mako`
- `versions/`
