package com.imhub.moment.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.imhub.moment.data.createComment.CreateCommentRequest;
import com.imhub.moment.data.createComment.CreateCommentResponse;
import com.imhub.moment.data.createComment.MomentCommentVO;
import com.imhub.moment.data.deleteComment.DeleteCommentRequest;
import com.imhub.moment.data.deleteComment.DeleteCommentResponse;
import com.imhub.moment.model.MomentComment;

import java.util.List;

public interface MomentCommentService extends IService<MomentComment> {

   CreateCommentResponse createComment(CreateCommentRequest request) throws Exception;

   DeleteCommentResponse deleteComment(DeleteCommentRequest request);

   List<MomentCommentVO> getCommentList(Long momentId, Integer page, Integer size);
}