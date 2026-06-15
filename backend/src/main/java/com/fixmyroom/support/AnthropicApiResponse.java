package com.fixmyroom.support;

import java.util.List;

public record AnthropicApiResponse(List<ContentBlock> content) {
    public record ContentBlock(String type, String text) {}
}
