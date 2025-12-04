import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { listingsApi } from "@/lib/api";
import { useConfig } from "@/contexts/ConfigContext";
import { toast } from "@/hooks/use-toast";
import { WizardLayout } from "@/components/create-listing/WizardLayout";
import { DesktopWizardLayout } from "@/components/create-listing/DesktopWizardLayout";
import { useIsMobile } from "@/hooks/use-mobile";
import { StepPropertyType } from "@/components/create-listing/steps/StepPropertyType";
import { StepLocation } from "@/components/create-listing/steps/StepLocation";
import { StepBasics } from "@/components/create-listing/steps/StepBasics";
import { StepAmenities } from "@/components/create-listing/steps/StepAmenities";
import { StepPricing } from "@/components/create-listing/steps/StepPricing";
import { StepPreferences } from "@/components/create-listing/steps/StepPreferences";
import { StepPhotos } from "@/components/create-listing/steps/StepPhotos";

interface MediaItem {
  id: number;
  url: string;
  isUploading?: boolean;
}

export default function CreateRoomListing() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { config } = useConfig();
  const isMobile = useIsMobile();
  const [listingId, setListingId] = useState<string | null>(id || null);

  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    description: "",
    monthlyRent: "",
    maintenance: "",
    maintenanceIncluded: false,
    deposit: "",
    availableDate: "",
    addressText: "",
    placeId: "",
    latitude: 0,
    longitude: 0,
    roomType: "",
    propertyType: [] as string[],
    bhkType: "",
    floor: "",
    hasBalcony: false,
    hasPrivateWashroom: false,
    hasFurniture: false,
    amenities: [] as string[],
    images: [] as MediaItem[],
    minAge: "",
    maxAge: "",
    gender: "",
    profession: "",
    lifestyle: [] as string[],
    // Keeping these for compatibility but not using in wizard yet
    roommates: [] as any[],
    neighborhoodReview: "",
    neighborhoodRatings: {
      safety: 0,
      connectivity: 0,
      amenities: 0,
    },
    neighborhoodImages: [] as any[],
  });

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLocationSelect = (address: string, placeId: string) => {
    setFormData(prev => ({
      ...prev,
      addressText: address,
      placeId: placeId,
    }));
  };

  const handleStepClick = (index: number) => {
    // Only allow navigating to previous steps or the current step
    if (index <= currentStep) {
      setCurrentStep(index);
    }
  };

  const steps = [
    {
      id: 'property',
      title: 'Property Details',
      description: 'What kind of place are you listing?',
      component: <StepPropertyType formData={formData} onChange={handleFieldChange} />
    },
    {
      id: 'location',
      title: 'Location',
      description: 'Where is your property located?',
      component: <StepLocation formData={formData} onChange={handleFieldChange} onLocationSelect={handleLocationSelect} />
    },
    {
      id: 'basics',
      title: 'The Basics',
      description: 'Tell us a bit more about the space.',
      component: <StepBasics formData={formData} onChange={handleFieldChange} />
    },
    {
      id: 'amenities',
      title: 'Amenities',
      description: 'Select all the amenities available.',
      component: <StepAmenities formData={formData} onChange={handleFieldChange} />
    },
    {
      id: 'pricing',
      title: 'Pricing',
      description: 'Set your monthly rent and deposit.',
      component: <StepPricing formData={formData} onChange={handleFieldChange} />
    },
    {
      id: 'preferences',
      title: 'Roommate Preferences',
      description: 'Who would be your ideal roommate?',
      component: <StepPreferences formData={formData} onChange={handleFieldChange} />
    },
    {
      id: 'photos',
      title: 'Photos',
      description: 'Add some photos of the room.',
      component: <StepPhotos listingId={listingId} images={formData.images} onChange={(imgs) => handleFieldChange("images", imgs)} />
    }
  ];

  const isStepValid = () => {
    const step = steps[currentStep];
    switch (step.id) {
      case 'property':
        return formData.roomType && formData.bhkType && formData.propertyType.length > 0;
      case 'location':
        return formData.addressText && formData.addressText.length > 5; // Basic check
      case 'basics':
        return formData.floor !== "" && formData.description.length > 10;
      case 'pricing':
        return formData.monthlyRent && formData.deposit;
      default:
        return true;
    }
  };

  const saveListing = async () => {
    setSaving(true);
    try {
      const payload: any = {};

      // Map formData to API payload
      if (formData.description) payload.description = formData.description;
      if (formData.monthlyRent) payload.monthlyRent = parseInt(formData.monthlyRent);
      if (formData.maintenance) payload.maintenance = parseInt(formData.maintenance);
      payload.maintenanceIncluded = formData.maintenanceIncluded;
      if (formData.deposit) payload.deposit = parseInt(formData.deposit);
      if (formData.availableDate) payload.availableDate = formData.availableDate;
      if (formData.addressText) payload.addressText = formData.addressText;
      if (formData.placeId) payload.placeId = formData.placeId;
      if (formData.latitude) payload.latitude = formData.latitude;
      if (formData.longitude) payload.longitude = formData.longitude;
      if (formData.roomType) payload.roomType = formData.roomType;
      if (formData.propertyType.length > 0) payload.propertyType = formData.propertyType;
      if (formData.bhkType) payload.bhkType = formData.bhkType;
      if (formData.floor) payload.floor = formData.floor;
      payload.hasBalcony = formData.hasBalcony;
      payload.hasPrivateWashroom = formData.hasPrivateWashroom;
      payload.hasFurniture = formData.hasFurniture;
      if (formData.amenities.length > 0) payload.amenities = formData.amenities;

      // Note: Images are handled separately via PhotoUploadGrid/API

      // Roommate Preferences
      const roommatePreferences: any = {};
      if (formData.minAge) roommatePreferences.minAge = parseInt(formData.minAge);
      if (formData.maxAge) roommatePreferences.maxAge = parseInt(formData.maxAge);
      if (formData.gender) roommatePreferences.gender = formData.gender;
      if (formData.profession) roommatePreferences.profession = formData.profession;
      if (formData.lifestyle.length > 0) roommatePreferences.lifestyle = formData.lifestyle;

      if (Object.keys(roommatePreferences).length > 0) {
        payload.roommatePreferences = roommatePreferences;
      }

      let response;
      if (listingId) {
        // Update existing
        response = await listingsApi.updateRoom(listingId, payload);
      } else {
        // Create new
        response = await listingsApi.createRoom(payload);
      }

      const savedId = response?.id || listingId;

      if (savedId && !listingId) {
        setListingId(savedId.toString());
        setSearchParams({ id: savedId.toString() });
      }

      return savedId;
    } catch (error: any) {
      console.error("Failed to save listing:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to save listing.",
        variant: "destructive",
      });
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    if (currentStep === steps.length - 1) {
      // Final step (Photos) - Finish
      navigate('/my-listings');
      return;
    }

    // If moving to Photos step (last step), save first
    if (steps[currentStep + 1].id === 'photos') {
      const id = await saveListing();
      if (id) {
        setCurrentStep(prev => prev + 1);
      }
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else {
      navigate(-1);
    }
  };

  const handleSkip = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  return (
    <WizardLayout
      currentStep={currentStep}
      totalSteps={steps.length}
      title={steps[currentStep].title}
      description={steps[currentStep].description}
      onNext={handleNext}
      onBack={handleBack}
      onSkip={handleSkip}
      isNextDisabled={!isStepValid() || saving}
      showCloseButton={true}
      showSkipButton={true}
    >
      {steps[currentStep].component}
    </WizardLayout>
  );
}
