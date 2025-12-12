import { useState } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { listingsApi } from "@/lib/api";
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
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { listingSchema, ListingFormData } from "@/schemas/listingSchema";

export default function CreateRoomListing() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const isMobile = useIsMobile();
  const [listingId, setListingId] = useState<string | null>(id || null);

  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Initialize form
  const form = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      description: "",
      monthlyRent: undefined,
      maintenance: undefined,
      maintenanceIncluded: false,
      deposit: undefined,
      availableDate: "",
      addressText: "",
      placeId: "",
      latitude: 0,
      longitude: 0,
      roomType: undefined,
      propertyType: [],
      bhkType: undefined,
      floor: undefined,
      amenities: [],
      images: [],
      minAge: undefined,
      maxAge: undefined,
      gender: undefined,
      profession: "",
      lifestyle: [],
    },
    mode: "onChange"
  });

  const { trigger, getValues } = form;

  // Define fields for each step to validate before moving next
  const stepFields: Record<string, (keyof ListingFormData)[]> = {
    property: ['roomType', 'bhkType', 'propertyType'],
    location: ['addressText', 'placeId', 'latitude', 'longitude'],
    basics: ['floor', 'availableDate', 'description'],
    amenities: ['amenities'],
    pricing: ['monthlyRent', 'deposit', 'maintenance', 'maintenanceIncluded'],
    preferences: ['gender', 'minAge', 'maxAge', 'profession', 'lifestyle'],
    photos: ['images']
  };

  const steps = [
    {
      id: 'property',
      title: 'Property Details',
      description: 'What kind of place are you listing?',
      component: <StepPropertyType />
    },
    {
      id: 'location',
      title: 'Location',
      description: 'Where is your property located?',
      component: <StepLocation />
    },
    {
      id: 'basics',
      title: 'The Basics',
      description: 'Tell us a bit more about the space.',
      component: <StepBasics />
    },
    {
      id: 'amenities',
      title: 'Room Features',
      description: 'Select amenities available in your room and property.',
      component: <StepAmenities />
    },
    {
      id: 'pricing',
      title: 'Pricing',
      description: 'Set your monthly rent and deposit.',
      component: <StepPricing />
    },
    {
      id: 'preferences',
      title: 'Roommate Preferences',
      description: 'Who would be your ideal roommate?',
      component: <StepPreferences />
    },
    {
      id: 'photos',
      title: 'Photos',
      description: 'Add some photos of the room.',
      component: <StepPhotos listingId={listingId} />
    }
  ];

  const saveListing = async () => {
    setSaving(true);
    try {
      const data = getValues();
      const payload: any = {};

      // Map formData to API payload
      if (data.description) payload.description = data.description;
      if (data.monthlyRent) payload.monthlyRent = Number(data.monthlyRent);
      if (data.maintenance) payload.maintenance = Number(data.maintenance);
      payload.maintenanceIncluded = data.maintenanceIncluded;
      if (data.deposit) payload.deposit = Number(data.deposit);
      if (data.availableDate) payload.availableDate = data.availableDate;
      if (data.addressText) payload.addressText = data.addressText;
      if (data.placeId) payload.placeId = data.placeId;
      if (data.latitude) payload.latitude = data.latitude;
      if (data.longitude) payload.longitude = data.longitude;
      if (data.roomType) payload.roomType = data.roomType;
      // Property Type is optional array
      if (data.propertyType && data.propertyType.length > 0) payload.propertyType = data.propertyType;

      if (data.bhkType !== undefined && data.bhkType !== null) payload.bhkType = Number(data.bhkType);
      if (data.floor !== undefined && data.floor !== null) payload.floor = Number(data.floor);


      if (data.amenities.length > 0) payload.amenities = data.amenities;

      // Roommate Preferences
      const roommatePreferences: any = {};
      if (data.minAge) roommatePreferences.minAge = Number(data.minAge);
      if (data.maxAge) roommatePreferences.maxAge = Number(data.maxAge);
      if (data.gender) roommatePreferences.gender = data.gender;
      if (data.profession) roommatePreferences.profession = data.profession;
      if (data.lifestyle && data.lifestyle.length > 0) roommatePreferences.lifestyle = data.lifestyle;

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
    const stepId = steps[currentStep].id;
    const fieldsToValidate = stepFields[stepId];

    // Trigger validation for current step fields
    const isStepValid = await trigger(fieldsToValidate);

    if (!isStepValid) {
      // Find the first error to toast or focus?
      // react-hook-form handles focus usually, but steps might be custom
      // We can show a generic toast if needed, but inline errors are better
      return;
    }

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
    <FormProvider {...form}>
      {isMobile ? (
        <WizardLayout
          currentStep={currentStep}
          totalSteps={steps.length}
          title={steps[currentStep].title}
          description={steps[currentStep].description}
          onNext={handleNext}
          onBack={handleBack}
          onSkip={handleSkip}
          isNextDisabled={saving} // Validation handled by inline errors and blocking handleNext, so we don't disable button to allow clicking to see errors
          showCloseButton={true}
          showSkipButton={steps[currentStep].id !== 'photos'}
        >
          {steps[currentStep].component}
        </WizardLayout>
      ) : (
        <DesktopWizardLayout
          currentStep={currentStep}
          totalSteps={steps.length}
          steps={steps}
          title={steps[currentStep].title}
          description={steps[currentStep].description}
          onNext={handleNext}
          onBack={handleBack}
          onStepClick={(idx) => setCurrentStep(idx)} // Ideally we should validate intermediate steps if jumping forward
          isNextDisabled={saving}
          nextLabel={currentStep === steps.length - 1 ? "Finish" : "Next"}
        >
          {steps[currentStep].component}
        </DesktopWizardLayout>
      )}
    </FormProvider>
  );
}
