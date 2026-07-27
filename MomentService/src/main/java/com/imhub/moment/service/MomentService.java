package com.imhub.moment.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.imhub.moment.common.Result;
import com.imhub.moment.data.createMoment.CreateMomentRequest;
import com.imhub.moment.data.createMoment.CreateMomentResponse;
import com.imhub.moment.data.deleteMoment.DeleteMomentRequest;
import com.imhub.moment.data.deleteMoment.DeleteMomentResponse;
import com.imhub.moment.data.getMomentList.MomentListVO;
import com.imhub.moment.model.Moment;

import java.util.List;

public interface MomentService extends IService<Moment> {
    CreateMomentResponse createMoment(CreateMomentRequest request) throws Exception;

    DeleteMomentResponse deleteMoment(DeleteMomentRequest request);

    Long getMomentOwnerId(Long momentId);

    List<MomentListVO> getMomentList(Long userId, Integer page, Integer size);
}