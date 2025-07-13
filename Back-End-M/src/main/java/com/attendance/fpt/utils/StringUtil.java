package com.attendance.fpt.utils;

import org.apache.commons.lang3.StringUtils;

public class StringUtil {
    public static String normalizeString(String text){
        text = StringUtils.stripAccents(text);
        text = text.toLowerCase();
        text = text.replaceAll("[^a-z0-9\\s]", "");
        text = text.replaceAll("\\s+", "-");
        return text;
    }
}
