package com.fixmyroom.leads;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum PropertyType {
    @JsonProperty("boutique_hotel")
    BOUTIQUE_HOTEL,

    @JsonProperty("luxury_villa")
    LUXURY_VILLA,

    @JsonProperty("glamping_resort")
    GLAMPING_RESORT,

    @JsonProperty("vacation_rental")
    VACATION_RENTAL,

    @JsonProperty("other")
    OTHER
}
