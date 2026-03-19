export interface BudgetaryResources {
  fiscal_year: number;
  agency_budgetary_resources: number;
  agency_total_obligated: number;
  agency_total_outlayed: number;
  total_budgetary_resources: number;
}

export interface AgencyBudgetaryResourcesResponse {
  toptier_code: string;
  agency_data_by_year: BudgetaryResources[];
  messages: string[];
}

export interface SubAgency {
  name: string;
  abbreviation: string;
  total_obligations: number;
  transaction_obligated_amount: number;
  new_award_count: number;
  children: SubAgencyOffice[];
}

export interface SubAgencyOffice {
  name: string;
  abbreviation: string;
  total_obligations: number;
  new_award_count: number;
}

export interface SubAgencyResponse {
  fiscal_year: number;
  toptier_code: string;
  results: SubAgency[];
  messages: string[];
}

export interface ObjectClass {
  id: number;
  name: string;
  obligated_amount: number;
  gross_outlay_amount: number;
  transaction_obligated_amount: number;
  children: {
    id: number;
    name: string;
    obligated_amount: number;
    gross_outlay_amount: number;
    transaction_obligated_amount: number;
  }[];
}

export interface ObjectClassResponse {
  fiscal_year: number;
  toptier_code: string;
  results: ObjectClass[];
  messages: string[];
}

export interface FederalAccount {
  name: string;
  account_number: string;
  id: string;
  obligated_amount: number;
  gross_outlay_amount: number;
  budget_authority_appropriated_amount: number;
}

export interface FederalAccountResponse {
  count: number;
  limit: number;
  page: number;
  results: FederalAccount[];
  messages: string[];
}

export interface SpendingOverTimeResult {
  time_period: {
    fiscal_year: string;
    quarter?: string;
  };
  aggregated_amount: number;
}

export interface SpendingOverTimeResponse {
  group: string;
  results: SpendingOverTimeResult[];
  messages: string[];
}

export interface SpendingByGeographyResult {
  shape_code: string;
  display_name: string;
  aggregated_amount: number;
  per_capita: number;
  population: number | null;
}

export interface SpendingByGeographyResponse {
  scope: string;
  geo_layer: string;
  results: SpendingByGeographyResult[];
  messages: string[];
}

export interface Award {
  id: string;
  generated_unique_award_id: string;
  piid?: string;
  type: string;
  type_description: string;
  description: string;
  total_obligation: number;
  awarding_agency: {
    toptier_agency: { name: string; code: string };
    subtier_agency: { name: string; code: string };
  };
  recipient: {
    recipient_name: string;
    recipient_uei: string;
    location: {
      city_name: string;
      state_code: string;
    };
  };
  period_of_performance: {
    start_date: string;
    end_date: string;
  };
  place_of_performance: {
    city_name: string;
    state_code: string;
  };
}

export interface SpendingByCategoryResult {
  id: string | number;
  code: string;
  name: string;
  amount: number;
}

export interface SpendingByCategoryResponse {
  category: string;
  limit: number;
  page: number;
  results: SpendingByCategoryResult[];
  messages: string[];
}
