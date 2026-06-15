package com.fixmyroom.leads;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum LeadType {
    @JsonProperty("demo")
    DEMO,

    @JsonProperty("pilot_waitlist")
    PILOT_WAITLIST
}
