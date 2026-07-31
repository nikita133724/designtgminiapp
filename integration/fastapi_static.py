from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles


def mount_zooma_frontend(app: FastAPI, export_dir: str | Path) -> None:
    """Serve a Next.js static export at /app without shadowing Zooma API routes.

    Register the existing `/app/api/*` HTTP routes and `/app/ws` WebSocket route
    before calling this function.
    """

    root = Path(export_dir).resolve()
    index_file = root / "index.html"
    next_static = root / "_next"

    if not index_file.is_file():
        raise RuntimeError(f"Missing static frontend entrypoint: {index_file}")
    if not next_static.is_dir():
        raise RuntimeError(f"Missing Next.js static assets: {next_static}")

    app.mount(
        "/app/_next",
        StaticFiles(directory=next_static),
        name="zooma_next_static",
    )

    @app.get("/app", include_in_schema=False)
    @app.get("/app/", include_in_schema=False)
    async def zooma_frontend_index() -> FileResponse:
        return FileResponse(index_file)
