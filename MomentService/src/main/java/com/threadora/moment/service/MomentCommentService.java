package com.threadora.moment.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.threadora.moment.data.createComment.CreateCommentRequest;
import com.threadora.moment.data.createComment.CreateCommentResponse;
import com.threadora.moment.data.createComment.MomentCommentVO;
import com.threadora.moment.data.deleteComment.DeleteCommentRequest;
import com.threadora.moment.data.deleteComment.DeleteCommentResponse;
import com.threadora.moment.model.MomentComment;

import java.util.List;

public interface MomentCommentService extends IService<MomentComment> {

   CreateCommentResponse createComment(CreateCommentRequest request) throws Exception;

   DeleteCommentResponse deleteComment(DeleteCommentRequest request);

   List<MomentCommentVO> getCommentList(Long momentId, Integer page, Integer size);
}