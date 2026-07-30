package com.threadora.auth.data.common.email;

import lombok.Data;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
public class EmailResponse {
    private String email;
}
