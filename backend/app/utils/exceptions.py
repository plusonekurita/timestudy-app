# utils/exceptions.py
from fastapi import HTTPException

class ApiException(HTTPException):
    def __init__(self, status_code: int, error: str, detail: str):
        super().__init__(
            status_code=status_code,
            detail={
                "error": error,
                "detail": detail,
                "code": status_code
            }
        )
