package com.threadora.moment.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.threadora.moment.common.Result;
import com.threadora.moment.data.createMoment.CreateMomentRequest;
import com.threadora.moment.data.createMoment.CreateMomentResponse;
import com.threadora.moment.data.deleteMoment.DeleteMomentRequest;
import com.threadora.moment.data.deleteMoment.DeleteMomentResponse;
import com.threadora.moment.data.getMomentList.MomentListVO;
import com.threadora.moment.model.Moment;

import java.util.List;

public interface MomentService extends IService<Moment> {
    CreateMomentResponse createMoment(CreateMomentRequest request) throws Exception;

    DeleteMomentResponse deleteMoment(DeleteMomentRequest request);

    Long getMomentOwnerId(Long momentId);

    List<MomentListVO> getMomentList(Long userId, Integer page, Integer size);
}