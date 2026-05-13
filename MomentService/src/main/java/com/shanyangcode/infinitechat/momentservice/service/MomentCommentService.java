package com.shanyangcode.infinitechat.momentservice.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.shanyangcode.infinitechat.momentservice.data.createComment.CreateCommentRequest;
import com.shanyangcode.infinitechat.momentservice.data.createComment.CreateCommentResponse;
import com.shanyangcode.infinitechat.momentservice.data.createComment.MomentCommentVO;
import com.shanyangcode.infinitechat.momentservice.data.deleteComment.DeleteCommentRequest;
import com.shanyangcode.infinitechat.momentservice.data.deleteComment.DeleteCommentResponse;
import com.shanyangcode.infinitechat.momentservice.model.MomentComment;

import java.util.List;

public interface MomentCommentService extends IService<MomentComment> {

   CreateCommentResponse createComment(CreateCommentRequest request) throws Exception;

   DeleteCommentResponse deleteComment(DeleteCommentRequest request);

   List<MomentCommentVO> getCommentList(Long momentId, Integer page, Integer size);
}