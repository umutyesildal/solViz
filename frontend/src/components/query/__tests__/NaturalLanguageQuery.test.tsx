import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NaturalLanguageQuery from "../NaturalLanguageQuery";
import { useQueryStore } from "@/store/query";
import { useChartsStore } from "@/store/charts";

// Mock the stores
jest.mock("@/store/query");
jest.mock("@/store/charts");

// Mock the react-vega component
jest.mock("react-vega", () => ({
  VegaLite: () => <div data-testid="vega-chart" />,
}));

describe("NaturalLanguageQuery Component", () => {
  // Default mock implementation for stores
  const mockSetQuery = jest.fn();
  const mockSetProvider = jest.fn();
  const mockExecuteQuery = jest.fn();
  const mockCreateChart = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock query store implementation
    (useQueryStore as jest.Mock).mockReturnValue({
      naturalLanguageQuery: "",
      provider: "flipside",
      result: null,
      isLoading: false,
      error: null,
      setQuery: mockSetQuery,
      setProvider: mockSetProvider,
      executeQuery: mockExecuteQuery,
    });

    // Mock charts store implementation
    (useChartsStore as jest.Mock).mockReturnValue({
      createChart: mockCreateChart,
    });
  });

  test("renders the form correctly", () => {
    render(<NaturalLanguageQuery />);

    // Check if key elements are rendered
    expect(
      screen.getByPlaceholderText(
        /E\.g\., What was the daily transaction volume/i
      )
    ).toBeTruthy();
    expect(screen.getByLabelText(/Data Provider/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /Get Results/i })).toBeTruthy();
  });

  test("calls setQuery when input changes", async () => {
    render(<NaturalLanguageQuery />);

    const input = screen.getByPlaceholderText(
      /E\.g\., What was the daily transaction volume/i
    );
    await userEvent.type(input, "Show me token transfers");

    expect(mockSetQuery).toHaveBeenCalledWith("Show me token transfers");
  });

  test("calls setProvider when provider changes", () => {
    render(<NaturalLanguageQuery />);

    const select = screen.getByLabelText(/Data Provider/i);
    fireEvent.change(select, { target: { value: "helius" } });

    expect(mockSetProvider).toHaveBeenCalledWith("helius");
  });

  test("calls executeQuery when form is submitted", async () => {
    // Mock a non-empty query
    (useQueryStore as jest.Mock).mockReturnValue({
      naturalLanguageQuery: "Show me token transfers",
      provider: "flipside",
      result: null,
      isLoading: false,
      error: null,
      setQuery: mockSetQuery,
      setProvider: mockSetProvider,
      executeQuery: mockExecuteQuery,
    });

    render(<NaturalLanguageQuery />);

    const button = screen.getByRole("button", { name: /Get Results/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockExecuteQuery).toHaveBeenCalled();
    });
  });

  test("displays loading state", () => {
    // Mock loading state
    (useQueryStore as jest.Mock).mockReturnValue({
      naturalLanguageQuery: "Show me token transfers",
      provider: "flipside",
      result: null,
      isLoading: true, // Set loading to true
      error: null,
      setQuery: mockSetQuery,
      setProvider: mockSetProvider,
      executeQuery: mockExecuteQuery,
    });

    render(<NaturalLanguageQuery />);

    expect(screen.getByText("Processing...")).toBeTruthy();
    expect(screen.getByText("Processing...")).toBeTruthy();
  });

  test("displays error message when there is an error", () => {
    const errorMessage = "Failed to execute query";

    // Mock error state
    (useQueryStore as jest.Mock).mockReturnValue({
      naturalLanguageQuery: "Show me token transfers",
      provider: "flipside",
      result: null,
      isLoading: false,
      error: errorMessage, // Set error message
      setQuery: mockSetQuery,
      setProvider: mockSetProvider,
      executeQuery: mockExecuteQuery,
    });

    render(<NaturalLanguageQuery />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  test("renders visualization when result is available", () => {
    // Mock successful result
    const mockResult = {
      data: { values: [{ x: 1, y: 10 }] },
      vega_spec: {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        mark: "bar",
        encoding: {
          x: { field: "x", type: "quantitative" },
          y: { field: "y", type: "quantitative" },
        },
      },
      sql_query: "SELECT * FROM transfers",
    };

    (useQueryStore as jest.Mock).mockReturnValue({
      naturalLanguageQuery: "Show me token transfers",
      provider: "flipside",
      result: mockResult,
      isLoading: false,
      error: null,
      setQuery: mockSetQuery,
      setProvider: mockSetProvider,
      executeQuery: mockExecuteQuery,
    });

    render(<NaturalLanguageQuery />);

    expect(screen.getByTestId("vega-chart")).toBeInTheDocument();
    expect(screen.getByText("Save Chart")).toBeTruthy();
  });
});
