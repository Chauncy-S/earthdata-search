# EDSC_32 As a user, I want to see a list of dataset facets 
#         so that I may find datasets by topic

require "spec_helper"

describe "Dataset Facets" do
  before do
    visit "/"
  end

  context "facet listings" do
    it "shows the first Campaign facet" do
      expect(page).to have_content("Campaigns EOSDIS (1552)")
    end
    
    it "shows the first Platforms facet" do
      expect(page).to have_content("Platforms FIELD INVESTIGATION (486)")
    end
    
    it "shows the first Instruments facet" do
      expect(page).to have_content("Instruments ANALYSIS (250)")
    end
    
    it "shows the first Sensors facet" do
      expect(page).to have_content("Sensors ANALYSIS (250)")
    end
    
    it "shows the first 2D Coordinate Name facet" do
      expect(page).to have_content("2D Coordinate Name MODIS Tile SIN (65)")
    end
    
    it "shows the first Category Keyword facet" do
      expect(page).to have_content("Category Keyword EARTH SCIENCE (12230)")
    end
    
    it "shows the first Topic Keyword facet" do
      expect(page).to have_content("Topic Keyword ATMOSPHERE (6099)")
    end
    
    it "shows the first Term Keyword facet" do
      expect(page).to have_content("Term Keyword VEGETATION (904)")
    end
    
    it "shows the first Variable Level 1 Keyword facet" do
      expect(page).to have_content("Variable Level 1 Keyword AIR TEMPERATURE (354)")
    end
    
    it "shows the first Variable Level 2 Keyword facet" do
      expect(page).to have_content("Variable Level 2 Keyword OZONE (143)")
    end
    
    it "shows the first Variable Level 3 Keyword facet" do
      expect(page).to have_content("Variable Level 3 Keyword TOOTHED WHALES (3)")
    end
    
    it "shows the first Detailed Variable Keyword facet" do
      expect(page).to have_content("Detailed Variable Keyword TOTAL OZONE (29)")
    end
    
    it "shows the first Processing Level facet" do
      expect(page).to have_content("Processing Level 3 (1541)")
    end
  end
end