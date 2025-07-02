package com.codeoftheweb.salvo;

import java.util.List;

public class ShipDTO {
    private String type;
    private List<String> locations;

    public ShipDTO() {
    } // Default constructor for JSON deserialization

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public List<String> getLocations() {
        return locations;
    }

    public void setLocations(List<String> locations) {
        this.locations = locations;
    }
}
