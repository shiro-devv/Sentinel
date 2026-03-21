"""
Structured logging configuration using Loguru.
"""
import sys
from pathlib import Path
from loguru import logger
from app.core.config import settings


def setup_logging():
    """Configure application logging."""
    
    # Remove default handler
    logger.remove()
    
    # Console handler
    logger.add(
        sys.stdout,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
        level="DEBUG" if settings.DEBUG else "INFO",
        colorize=True,
    )
    
    # File handler for general logs
    log_dir = Path("./logs")
    log_dir.mkdir(exist_ok=True)
    
    logger.add(
        log_dir / "app_{time:YYYY-MM-DD}.log",
        format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
        level="INFO",
        rotation="00:00",
        retention="30 days",
        compression="zip",
    )
    
    # File handler for errors
    logger.add(
        log_dir / "error_{time:YYYY-MM-DD}.log",
        format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
        level="ERROR",
        rotation="00:00",
        retention="90 days",
        compression="zip",
    )
    
    # Notification log
    logger.add(
        log_dir / "notifications_{time:YYYY-MM-DD}.log",
        format="{time:YYYY-MM-DD HH:mm:ss} | {message}",
        filter=lambda record: record["extra"].get("notification", False),
        rotation="00:00",
        retention="30 days",
    )
    
    return logger


def get_logger(name: str):
    """Get a logger instance with context."""
    return logger.bind(name=name)


# Request logging middleware
async def log_requests(request, call_next):
    """Log incoming HTTP requests."""
    import time
    from loguru import logger
    
    start_time = time.time()
    
    logger.info(
        f"Request: {request.method} {request.url.path}",
        extra={"client": request.client.host if request.client else "unknown"}
    )
    
    response = await call_next(request)
    
    process_time = time.time() - start_time
    logger.info(
        f"Response: {request.method} {request.url.path} - Status: {response.status_code} - Time: {process_time:.4f}s"
    )
    
    return response
