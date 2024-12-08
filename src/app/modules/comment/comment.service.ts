import { Comment } from '@prisma/client';
import prisma from '../../../shared/prisma';

interface CommentData {
  blogId: string;
  comment: string;
}


const postComment = async (data: CommentData, userId: string): Promise<Comment> => {
  const commentData = {
    ...data,
    userId, // Add userId to the data
  };

  const result = await prisma.comment.create({
    data: commentData,
    include: {
      user: true,
      blog: true,
    },
  });

  return result;
};

const getAllComment = async (): Promise<Comment[] | any> => {
  const result = await prisma.comment.findMany({
    include: {
      user: true,
    },
  });
  return {
    data: result,
  };
};

const getCommentByBlogId = async (id: string): Promise<Comment[] | null> => {

  const result = await prisma.comment.findMany({
    where: {
      blogId: id,
    },
    include: {
      user: true,
    },
    orderBy:{
      createdAt: 'desc'
    }
  });
  return result;
};
export const CommentService = {
  postComment,
  getAllComment,
  getCommentByBlogId,
};
