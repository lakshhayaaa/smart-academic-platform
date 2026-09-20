from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from models.comment import Comment
from models.resouce import Resource
from models.user import User


router = APIRouter(
    prefix="/comments",
    tags=["Comments"]
)


class CommentRequest(BaseModel):
    resource_id: int
    roll_no: Optional[str] = None
    comment: str


@router.post("")
def add_comment(
    data: CommentRequest,
    db: Session = Depends(get_db)
):
    new_comment = Comment(
        resource_id=data.resource_id,
        roll_no=data.roll_no,
        comment=data.comment
    )

    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)

    return {
        "message": "Comment added successfully",
        "comment_id": new_comment.comment_id
    }


@router.get("/{resource_id}")
def get_comments(
    resource_id: int,
    db: Session = Depends(get_db)
):
    comments = (
        db.query(Comment)
        .filter(Comment.resource_id == resource_id)
        .order_by(Comment.created_at.desc())
        .all()
    )

    return [
        {
            "comment_id": comment.comment_id,
            "resource_id": comment.resource_id,
            "roll_no": comment.roll_no,
            "comment": comment.comment,
            "created_at": comment.created_at
        }
        for comment in comments
    ]