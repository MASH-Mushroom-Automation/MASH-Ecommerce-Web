/**
 * AddressPicker Component Tests
 *
 * Tests for the Google Maps-based address picker with autocomplete,
 * map interaction, GPS location, and manual address entry fallback.
 */

import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { AddressPicker, SelectedAddress } from "../AddressPicker";

// ---------------------------------------------------------------------------
// Mock Google Maps globals
// ---------------------------------------------------------------------------

const mockSetCenter = jest.fn();
const mockSetZoom = jest.fn();
const mockSetPosition = jest.fn();
const mockAddListenerMap = jest.fn();
const mockAddListenerMarker = jest.fn();
const mockAddListenerAutocomplete = jest.fn();
const mockGetPlace = jest.fn();
const mockGeocode = jest.fn();

function buildGoogleMapsMock() {
  const markerInstance = {
    setPosition: mockSetPosition,
    addListener: mockAddListenerMarker,
    getPosition: jest.fn(() => ({
      lat: () => 14.5995,
      lng: () => 120.9842,
    })),
  };

  const mapInstance = {
    setCenter: mockSetCenter,
    setZoom: mockSetZoom,
    addListener: mockAddListenerMap,
  };

  const autocompleteInstance = {
    addListener: mockAddListenerAutocomplete,
    getPlace: mockGetPlace,
  };

  const geocoderInstance = {
    geocode: mockGeocode,
  };

  return {
    maps: {
      Map: jest.fn(() => mapInstance),
      Marker: jest.fn(() => markerInstance),
      Geocoder: jest.fn(() => geocoderInstance),
      Animation: { DROP: 1, BOUNCE: 2 },
      Size: jest.fn((w: number, h: number) => ({ width: w, height: h })),
      places: {
        Autocomplete: jest.fn(() => autocompleteInstance),
      },
      __mapInstance: mapInstance,
      __markerInstance: markerInstance,
      __autocompleteInstance: autocompleteInstance,
      __geocoderInstance: geocoderInstance,
    },
  };
}

// ---------------------------------------------------------------------------
// Environment & DOM helpers
// ---------------------------------------------------------------------------

const ORIGINAL_ENV = process.env;

function setApiKey(key: string | undefined) {
  if (key === undefined) {
    delete process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  } else {
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = key;
  }
}

/** Helper to create default props */
function createProps(
  overrides: Partial<React.ComponentProps<typeof AddressPicker>> = {}
) {
  return {
    onAddressSelect: jest.fn(),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe("AddressPicker", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();

    // Reset env
    process.env = { ...ORIGINAL_ENV };
    setApiKey("TEST_MAPS_KEY");

    // Install the Google Maps mock on window
    (window as any).google = buildGoogleMapsMock();

    // Reset the singleton module-level promise so each test gets a fresh init.
    // The module keeps `googleMapsPromise` in closure – because the window.google
    // object is already present the component will skip script loading and go
    // straight to map initialisation.
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  // -----------------------------------------------------------------------
  // Rendering
  // -----------------------------------------------------------------------

  it("renders the address input field", async () => {
    render(<AddressPicker {...createProps()} />);

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("Enter your delivery address...")
      ).toBeInTheDocument();
    });
  });

  it("renders with custom placeholder text", async () => {
    render(
      <AddressPicker
        {...createProps({ placeholder: "Type your address here" })}
      />
    );

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("Type your address here")
      ).toBeInTheDocument();
    });
  });

  it("renders the map container div", () => {
    const { container } = render(<AddressPicker {...createProps()} />);
    // The map div has a fixed height class
    const mapDiv = container.querySelector(".h-\\[300px\\]");
    expect(mapDiv).toBeInTheDocument();
  });

  it("renders the Use GPS button", async () => {
    render(<AddressPicker {...createProps()} />);

    await waitFor(() => {
      expect(screen.getByText("Use GPS")).toBeInTheDocument();
    });
  });

  it("renders the help tip text", async () => {
    render(<AddressPicker {...createProps()} />);

    await waitFor(() => {
      expect(
        screen.getByText(/Click on the map or drag the marker/i)
      ).toBeInTheDocument();
    });
  });

  it("applies custom className", () => {
    const { container } = render(
      <AddressPicker {...createProps({ className: "my-custom-class" })} />
    );
    expect(container.firstChild).toHaveClass("my-custom-class");
  });

  it("pre-fills the input with defaultValue", async () => {
    render(
      <AddressPicker
        {...createProps({ defaultValue: "123 Main St, Manila" })}
      />
    );

    await waitFor(() => {
      const input = screen.getByPlaceholderText(
        "Enter your delivery address..."
      ) as HTMLInputElement;
      expect(input.value).toBe("123 Main St, Manila");
    });
  });

  // -----------------------------------------------------------------------
  // Loading state
  // -----------------------------------------------------------------------

  it("shows a loading spinner while Google Maps initialises", () => {
    // Remove google so the component stays in loading state
    delete (window as any).google;

    // The loadGoogleMapsScript will be called but won't resolve because
    // there is no script tag to load – the component stays in isLoading=true
    render(<AddressPicker {...createProps()} />);

    // The loading overlay contains a Loader2 spinner inside the map area
    // The input should be disabled during loading
    const input = screen.getByPlaceholderText("Enter your delivery address...");
    expect(input).toBeDisabled();
  });

  it("disables the Use GPS button while loading", () => {
    delete (window as any).google;

    render(<AddressPicker {...createProps()} />);

    const gpsButton = screen.getByRole("button");
    expect(gpsButton).toBeDisabled();
  });

  // -----------------------------------------------------------------------
  // Google Maps initialisation
  // -----------------------------------------------------------------------

  it("initialises google.maps.Map on the map container", async () => {
    render(<AddressPicker {...createProps()} />);

    await waitFor(() => {
      expect(window.google.maps.Map).toHaveBeenCalled();
    });
  });

  it("initialises places Autocomplete with PH country restriction", async () => {
    render(<AddressPicker {...createProps()} />);

    await waitFor(() => {
      expect(window.google.maps.places.Autocomplete).toHaveBeenCalledWith(
        expect.any(HTMLElement),
        expect.objectContaining({
          componentRestrictions: { country: "ph" },
        })
      );
    });
  });

  it("creates a draggable Marker", async () => {
    render(<AddressPicker {...createProps()} />);

    await waitFor(() => {
      expect(window.google.maps.Marker).toHaveBeenCalledWith(
        expect.objectContaining({
          draggable: true,
        })
      );
    });
  });

  it("creates a Geocoder instance", async () => {
    render(<AddressPicker {...createProps()} />);

    await waitFor(() => {
      expect(window.google.maps.Geocoder).toHaveBeenCalled();
    });
  });

  // -----------------------------------------------------------------------
  // Input interaction
  // -----------------------------------------------------------------------

  it("updates the input value when the user types", async () => {
    render(<AddressPicker {...createProps()} />);

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("Enter your delivery address...")
      ).not.toBeDisabled();
    });

    const input = screen.getByPlaceholderText("Enter your delivery address...");
    fireEvent.change(input, { target: { value: "Makati City" } });
    expect((input as HTMLInputElement).value).toBe("Makati City");
  });

  // -----------------------------------------------------------------------
  // Autocomplete place_changed
  // -----------------------------------------------------------------------

  it("calls onAddressSelect when a place is selected via autocomplete", async () => {
    const onAddressSelect = jest.fn();
    render(<AddressPicker {...createProps({ onAddressSelect })} />);

    // Wait for init to complete
    await waitFor(() => {
      expect(mockAddListenerAutocomplete).toHaveBeenCalledWith(
        "place_changed",
        expect.any(Function)
      );
    });

    // Simulate place_changed callback
    const placeChangedHandler = mockAddListenerAutocomplete.mock.calls.find(
      (c: any[]) => c[0] === "place_changed"
    )?.[1];
    expect(placeChangedHandler).toBeDefined();

    mockGetPlace.mockReturnValue({
      formatted_address: "BGC, Taguig, Metro Manila",
      geometry: {
        location: {
          lat: () => 14.5547,
          lng: () => 121.0504,
        },
      },
      address_components: [
        {
          long_name: "Bonifacio Global City",
          types: ["locality"],
        },
        {
          long_name: "Metro Manila",
          types: ["administrative_area_level_1"],
        },
        {
          long_name: "1634",
          types: ["postal_code"],
        },
      ],
    });

    act(() => {
      placeChangedHandler();
    });

    expect(onAddressSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        formattedAddress: "BGC, Taguig, Metro Manila",
        lat: 14.5547,
        lng: 121.0504,
        components: expect.objectContaining({
          city: "Bonifacio Global City",
          state: "Metro Manila",
          zipCode: "1634",
        }),
      })
    );
  });

  it("centers the map and moves the marker on autocomplete selection", async () => {
    render(<AddressPicker {...createProps()} />);

    await waitFor(() => {
      expect(mockAddListenerAutocomplete).toHaveBeenCalled();
    });

    const placeChangedHandler = mockAddListenerAutocomplete.mock.calls.find(
      (c: any[]) => c[0] === "place_changed"
    )?.[1];

    mockGetPlace.mockReturnValue({
      formatted_address: "Makati CBD",
      geometry: {
        location: {
          lat: () => 14.5547,
          lng: () => 121.0244,
        },
      },
      address_components: [],
    });

    act(() => {
      placeChangedHandler();
    });

    expect(mockSetCenter).toHaveBeenCalledWith({
      lat: 14.5547,
      lng: 121.0244,
    });
    expect(mockSetZoom).toHaveBeenCalledWith(16);
    expect(mockSetPosition).toHaveBeenCalledWith({
      lat: 14.5547,
      lng: 121.0244,
    });
  });

  // -----------------------------------------------------------------------
  // GPS / Geolocation
  // -----------------------------------------------------------------------

  it("calls navigator.geolocation.getCurrentPosition when Use GPS is clicked", async () => {
    const mockGetCurrentPosition = jest.fn();
    Object.defineProperty(navigator, "geolocation", {
      value: { getCurrentPosition: mockGetCurrentPosition },
      configurable: true,
    });

    render(<AddressPicker {...createProps()} />);

    await waitFor(() => {
      expect(screen.getByText("Use GPS")).not.toBeDisabled();
    });

    fireEvent.click(screen.getByText("Use GPS"));

    expect(mockGetCurrentPosition).toHaveBeenCalledWith(
      expect.any(Function), // success
      expect.any(Function), // error
      expect.objectContaining({ enableHighAccuracy: true })
    );
  });

  it("shows location denied error when geolocation permission is refused", async () => {
    const mockGetCurrentPosition = jest.fn((_success, errorCb) => {
      errorCb({ code: 1, message: "User denied" });
    });
    Object.defineProperty(navigator, "geolocation", {
      value: { getCurrentPosition: mockGetCurrentPosition },
      configurable: true,
    });

    render(<AddressPicker {...createProps()} />);

    await waitFor(() => {
      expect(screen.getByText("Use GPS")).not.toBeDisabled();
    });

    fireEvent.click(screen.getByText("Use GPS"));

    await waitFor(() => {
      expect(
        screen.getByText(
          /Location access denied. Please enable location services/i
        )
      ).toBeInTheDocument();
    });
  });

  it("shows generic geolocation error for non-permission failures", async () => {
    const mockGetCurrentPosition = jest.fn((_success, errorCb) => {
      errorCb({ code: 2, message: "Position unavailable" });
    });
    Object.defineProperty(navigator, "geolocation", {
      value: { getCurrentPosition: mockGetCurrentPosition },
      configurable: true,
    });

    render(<AddressPicker {...createProps()} />);

    await waitFor(() => {
      expect(screen.getByText("Use GPS")).not.toBeDisabled();
    });

    fireEvent.click(screen.getByText("Use GPS"));

    await waitFor(() => {
      expect(
        screen.getByText(
          /Could not get your location. Please enter address manually/i
        )
      ).toBeInTheDocument();
    });
  });

  it("shows error when geolocation is not supported", async () => {
    // Remove geolocation
    Object.defineProperty(navigator, "geolocation", {
      value: undefined,
      configurable: true,
    });

    render(<AddressPicker {...createProps()} />);

    await waitFor(() => {
      expect(screen.getByText("Use GPS")).not.toBeDisabled();
    });

    fireEvent.click(screen.getByText("Use GPS"));

    await waitFor(() => {
      expect(
        screen.getByText(/Geolocation is not supported by your browser/i)
      ).toBeInTheDocument();
    });
  });

  // -----------------------------------------------------------------------
  // No API key fallback (manual entry)
  // -----------------------------------------------------------------------

  it("renders manual entry fallback when API key is missing", async () => {
    setApiKey(undefined);
    // We also need to remove the google global so init actually fails
    delete (window as any).google;

    // The component shows the fallback when error is truthy AND the env var
    // is absent. We need to wait for the initMap useEffect to run and set
    // the error state.
    render(<AddressPicker {...createProps()} />);

    await waitFor(() => {
      expect(
        screen.getByText(/Google Maps is not configured/i)
      ).toBeInTheDocument();
    });
  });

  it("allows typing in the manual fallback input", async () => {
    setApiKey(undefined);
    delete (window as any).google;

    render(<AddressPicker {...createProps()} />);

    await waitFor(() => {
      expect(
        screen.getByText(/Google Maps is not configured/i)
      ).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText("Enter your delivery address...");
    fireEvent.change(input, { target: { value: "456 Elm St" } });
    expect((input as HTMLInputElement).value).toBe("456 Elm St");
  });

  // -----------------------------------------------------------------------
  // Error display
  // -----------------------------------------------------------------------

  it("displays error text with warning icon when Maps fails to load", async () => {
    // Keep google.maps present so it passes the guard, but make Map throw
    // so that the catch block runs and sets the error state.
    const brokenGoogle = buildGoogleMapsMock();
    (brokenGoogle.maps.Map as jest.Mock).mockImplementation(() => {
      throw new Error("Simulated Maps init failure");
    });
    (window as any).google = brokenGoogle;

    render(<AddressPicker {...createProps()} />);

    await waitFor(() => {
      expect(
        screen.getByText(/Failed to load Google Maps/i)
      ).toBeInTheDocument();
    });
  });

  // -----------------------------------------------------------------------
  // SelectedAddress type shape
  // -----------------------------------------------------------------------

  it("provides correct SelectedAddress shape via onAddressSelect", async () => {
    const onAddressSelect = jest.fn();
    render(<AddressPicker {...createProps({ onAddressSelect })} />);

    await waitFor(() => {
      expect(mockAddListenerAutocomplete).toHaveBeenCalled();
    });

    const handler = mockAddListenerAutocomplete.mock.calls.find(
      (c: any[]) => c[0] === "place_changed"
    )?.[1];

    mockGetPlace.mockReturnValue({
      formatted_address: "Test Addr",
      geometry: {
        location: { lat: () => 10, lng: () => 20 },
      },
      address_components: [
        { long_name: "Main St", types: ["route"] },
        { long_name: "Manila", types: ["locality"] },
        { long_name: "NCR", types: ["administrative_area_level_1"] },
        { long_name: "1000", types: ["postal_code"] },
      ],
    });

    act(() => {
      handler();
    });

    const addr: SelectedAddress = onAddressSelect.mock.calls[0][0];
    expect(addr).toEqual({
      formattedAddress: "Test Addr",
      lat: 10,
      lng: 20,
      components: {
        street: "Main St",
        city: "Manila",
        state: "NCR",
        zipCode: "1000",
      },
    });
  });
});
