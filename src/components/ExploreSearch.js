import React from 'react';
import { useState, useEffect } from 'react'
import { styled } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import { Box, Button, FormControl, FormControlLabel, Grid, NativeSelect, Switch, Tooltip, Typography } from "@mui/material";
import DataTable from './ExploreSearchTable';
import domainOptions from "./../assets/dropdown.json"
import InfoIcon from '@mui/icons-material/Info';
import "./ExploreSearch.css";
import NeonButton from './Button';
import DownloadDialogButton from './EditAdvanced';
import CircularProgress from '@mui/material/CircularProgress';
import { useMetadata } from './UseMetadata';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useSearchParams } from 'react-router-dom';
import {
  parseNaturalLanguageSearch,
  parseNaturalLanguageSearchWithLlm,
  resolveContextCmid,
  toUiProperty,
  validateApiSearchParams
} from '../utils/nlpSearch';

const BootstrapInput = styled(InputBase)(({ theme }) => ({
  'label + &': {
    marginTop: theme.spacing(3),
  },
  '& .MuiInputBase-input': {
    borderRadius: 4,
    position: 'relative',
    backgroundColor: "white",
    border: '1px solid #ced4da',
    fontSize: 16,
    padding: '10px 26px 10px 12px',
    transition: theme.transitions.create(['border-color', 'box-shadow']),
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    '&:focus': {
      borderRadius: 4,
      borderColor: '#80bdff',
      boxShadow: '0 0 0 0.2rem rgba(255,255,255,.25)',
    },
  },
}));

const MAX_NLP_LOG_ENTRIES = 1200;
const CONTEXT_SPLIT_REGEX = /[,\s;]+/;

export default function Searchbar({ database }) {

  const [searchParams, setSearchParams] = useSearchParams();

  const [domainDrop, setdomainDrop] = React.useState('ALL NODES');

  const [advdomainDrop, setadvdomainDrop] = React.useState('ALL NODES');

  const [advoptions, setadvoptions] = React.useState(['ALL NODES']);

  const [selectedOption, setSelectedOption] = useState('Name');

  const [users, setUsers] = useState([]);

  const [tvalue, settvalue] = useState('');

  const [yearStart, setyearStart] = useState(null);

  const [yearEnd, setyearEnd] = useState(null);

  const [isChecked, setIsChecked] = useState(false);

  const [contextID, setcontextID] = useState(null);
  const [contextMode, setContextMode] = useState("all");

  const [datasetID, setdatasetID] = useState(null);

  const [qcount, setqcount] = useState(null);

  const [cmid_download, setCMIDDownload] = useState(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [nlpProcessing, setNlpProcessing] = useState(false);

  const [useNlpSearch, setUseNlpSearch] = useState(false);

  const [nlpSummary, setNlpSummary] = useState("");
  const [nlpLogs, setNlpLogs] = useState([]);

  const fallbackOptions = ["Name", "Key", "CatMapper ID (CMID)"];

  const { infodata } = useMetadata(database);


  const [countries, setCountries] = useState([
    { "name": "", "code": "" }
  ]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {

        const response = await fetch(`${process.env.REACT_APP_API_URL}/metadata/getCountries/${database}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        setCountries([
          { "name": "", "code": "" },
          ...data
        ]);

      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };

    if (database) {
      fetchCountries();
    }
  }, [database]);
  const [selectedcountry, setSelectedCountry] = useState(countries[0].code);
  const [selectedCategory, setSelectedCategory] = useState({});

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/metadata/subdomains/${database}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const normalized = {};

        data.forEach(({ domain, subdomains }) => {
          normalized[domain] = subdomains;
        });

        setSelectedCategory(normalized);
      })
      .catch((err) => {
        console.error("Error loading subdomains:", err);

        if (err.message.includes("NetworkError when attempting to fetch resource.")) {
          alert("We’re very sorry, but the server is currently down.  Please check back in a few minutes (or email dhruschk@asu.edu).")
        }
      });
  }, [database]);

  const [optionsForSelectedCategory, setoptionsForSelectedCategory] = useState(domainOptions[advdomainDrop] || fallbackOptions)

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/metadata/domainDescriptions/${database}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load domain descriptions");
        return res.json();
      })
      .then((data) => {
        // Assuming data is in the format [{ label: "X", description: "Y" }, ...]
        setCategories(data);
      })
      .catch((err) => {
        console.error("Error loading categories:", err);
      });
  }, [database]);



  const searchStateKey = `${database}_searchState`;
  const usersKey = `${database}_myData`;
  const nlpLogKey = `${database}_nlpQueryLog`;

  useEffect(() => {
    try {
      const storedLogs = localStorage.getItem(nlpLogKey);
      if (!storedLogs) {
        setNlpLogs([]);
        return;
      }

      const parsedLogs = JSON.parse(storedLogs);
      setNlpLogs(Array.isArray(parsedLogs) ? parsedLogs : []);
    } catch (error) {
      console.error("Error loading NLP logs:", error);
      setNlpLogs([]);
    }
  }, [nlpLogKey]);

  useEffect(() => {
    try {
      localStorage.setItem(nlpLogKey, JSON.stringify(nlpLogs));
    } catch (error) {
      console.error("Error saving NLP logs:", error);
    }
  }, [nlpLogKey, nlpLogs]);

  useEffect(() => {
    const storedState = sessionStorage.getItem(searchStateKey);
    if (storedState) {
      const {
        domainDrop,
        advdomainDrop,
        advoptions,
        selectedOption,
        selectedcountry,
        tvalue,
        yearStart,
        yearEnd,
        isChecked,
        contextID,
        contextMode,
        datasetID,
        optionsForSelectedCategory,
        useNlpSearch
      } = JSON.parse(storedState);

      setdomainDrop(domainDrop);
      setadvdomainDrop(advdomainDrop);
      setadvoptions(advoptions);
      setSelectedOption(selectedOption);
      setSelectedCountry(selectedcountry);
      settvalue(tvalue);
      setyearStart(yearStart);
      setyearEnd(yearEnd);
      setIsChecked(isChecked);
      setcontextID(contextID);
      setContextMode(contextMode === "any" ? "any" : "all");
      setdatasetID(datasetID);
      setUseNlpSearch(Boolean(useNlpSearch));
      //setqlimit(qlimit);
      setoptionsForSelectedCategory(optionsForSelectedCategory);
    }
  }, [searchStateKey]);

  // Save state to sessionStorage
  useEffect(() => {
    sessionStorage.setItem(searchStateKey, JSON.stringify({
      domainDrop,
      advdomainDrop,
      advoptions,
      selectedOption,
      selectedcountry,
      tvalue,
      yearStart,
      yearEnd,
      isChecked,
      contextID,
      contextMode,
      datasetID,
      optionsForSelectedCategory,
      useNlpSearch
    }));
  }, [searchStateKey, domainDrop, advdomainDrop, advoptions, selectedOption, selectedcountry, tvalue, yearStart, yearEnd, isChecked, contextID, contextMode, datasetID, optionsForSelectedCategory, useNlpSearch]);

  // Fetch and save users data to sessionStorage
  useEffect(() => {
    const storedUsers = sessionStorage.getItem(usersKey);
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    }
  }, [usersKey]);

  useEffect(() => {
    sessionStorage.setItem(usersKey, JSON.stringify(users));
  }, [usersKey, users]);

  const handleAdvancedSearchChange = () => {
    setIsChecked(!isChecked);
    setSelectedCountry(countries[0].code)
  };

  const handleReset = () => {
    setdomainDrop("ALL NODES")
    setadvdomainDrop("ALL NODES")
    setadvoptions(["ALL NODES"])
    setSelectedOption("Name")
    setSelectedCountry(countries[0].code)
    setyearStart("")
    setyearEnd("")
    setcontextID("")
    setContextMode("all")
    setdatasetID("")
    setNlpSummary("")
  }

  const appendNlpLogEntry = (entry = {}) => {
    const safeEntry = {
      timestamp: new Date().toISOString(),
      ...entry
    };

    setNlpLogs((previous) => {
      const next = [...previous, safeEntry];
      if (next.length <= MAX_NLP_LOG_ENTRIES) return next;
      return next.slice(next.length - MAX_NLP_LOG_ENTRIES);
    });

    void persistNlpLogOnServer(safeEntry);
  };

  const persistNlpLogOnServer = async (entry = {}) => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/nlp/parse-log`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(entry)
      });
    } catch (error) {
      console.error("Error saving NLP parse log on server:", error);
    }
  };

  const tooltipContent = (
    <div className="tooltip-width">
      <h3>From which category domain do you want to find matches?</h3>
      <table className="full-width-table">
        <thead>
          <tr>
            <th className="table-header">Label</th>
            <th className="table-header">Description</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category, index) => (
            <tr key={index}>
              <td className="table-cell">{category.label === "DISTRICT" ? "AREA" : category.label}</td>
              <td className="table-cell">{category.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const tooltipContent2 = (
    <div className="tooltip-width">
      <h3>From which category sub-domain do you want to find matches?</h3>
      <table className="full-width-table">
        <thead>
          <tr>
            <th className="table-header">Label</th>
            <th className="table-header">Description</th>
          </tr>
        </thead>
        <tbody>
          {infodata && selectedCategory?.[domainDrop]?.length > 0 ? (
            infodata
              .filter(desc => selectedCategory[domainDrop].includes(desc.label))
              .map((category, index) => (
                <tr key={index}>
                  <td className="table-cell">{category.label}</td>
                  <td className="table-cell">{category.description}</td>
                </tr>
              ))
          ) : (
            <tr>
              <td colSpan={2} style={{ padding: '8px', fontStyle: 'italic' }}>
                Loading...
              </td>
            </tr>
          )}

        </tbody>
      </table>
    </div>
  );

  const tooltipContent3 = (
    <div className="tooltip-width">
      <h4>Property Descriptions</h4>
      <table className="full-width-table">
        <thead>
          <tr>
            <th className="table-header">Label</th>
            <th className="table-header">Description</th>
          </tr>
        </thead>
        <tbody>
          {infodata && (domainOptions?.[advdomainDrop] || fallbackOptions) ? (
            infodata
              .filter(desc => (domainOptions[advdomainDrop] || fallbackOptions).includes(desc.label))
              .map((category, index) => (
                <tr key={index}>
                  <td className="table-cell">{category.label}</td>
                  <td className="table-cell">{category.description}</td>
                </tr>
              ))
          ) : (
            <tr>
              <td colSpan={2} style={{ padding: '8px', fontStyle: 'italic' }}>
                Loading...
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const runSearchRequest = (paramsToUse) => {
    const term = paramsToUse.get("term");
    const dom = paramsToUse.get("domain");

    if (!term && !dom) return;

    setLoading(true);

    fetch(`${process.env.REACT_APP_API_URL}/search?${paramsToUse.toString()}&query=false`, {
      method: "GET"
    })
      .then(response => response.json())
      .then(data => {
        if (!data.data || data.count[0].totalCount === 0) {
          setUsers([]);
          setSnackbarOpen(true);
        } else {
          setUsers(data.data);
          setqcount(data.count[0].totalCount);
          setCMIDDownload(data.count[0].CMID);
        }
      })
      .catch(error => {
        console.error("Fetch error:", error);
        setSnackbarOpen(true);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const applySearchParams = (params) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value != null && value !== "")
    );
    const nextParams = new URLSearchParams(cleanParams);
    const currentParams = new URLSearchParams(searchParams.toString());

    if (nextParams.toString() === currentParams.toString()) {
      // Re-run search for repeated click on identical query params.
      runSearchRequest(nextParams);
      return;
    }

    setSearchParams(cleanParams);
  };

  const parseContextIds = (value = "") => {
    const parsed = String(value || "")
      .split(CONTEXT_SPLIT_REGEX)
      .map((entry) => entry.trim())
      .filter(Boolean);
    return [...new Set(parsed)];
  };

  const buildDirectSearchParams = (termValue, domainValue) => {
    const contextIds = parseContextIds(contextID);
    return {
      domain: domainValue,
      property: selectedOption,
      term: termValue,
      database: database,
      yearStart: yearStart,
      yearEnd: yearEnd,
      country: selectedcountry,
      contexts: contextIds.join(","),
      contextMode: contextIds.length > 1 ? contextMode : "",
      dataset: datasetID
    };
  };

  const findCountryCode = (countryName = "") => {
    const normalized = countryName.trim().toLowerCase();
    if (!normalized) return "";

    const match = countries.find(
      (country) => country.name && country.name.trim().toLowerCase() === normalized
    );
    return match?.code || "";
  };

  const findParentDomainForSubdomain = (subdomain = "") => {
    if (!subdomain) return "";
    for (const [parent, subdomains] of Object.entries(selectedCategory)) {
      if (Array.isArray(subdomains) && subdomains.includes(subdomain)) {
        return parent;
      }
    }
    return "";
  };

  const syncAdvancedControlsFromParams = (params = {}) => {
    const requestedDomain = params.domain || "";
    const parentDomain =
      findParentDomainForSubdomain(requestedDomain) ||
      (selectedCategory[requestedDomain] ? requestedDomain : "");

    if (parentDomain) {
      const nextSubdomains = selectedCategory[parentDomain] || [];
      setdomainDrop(parentDomain);
      setadvoptions(nextSubdomains);
    }

    if (requestedDomain) {
      setadvdomainDrop(requestedDomain);
      setoptionsForSelectedCategory(domainOptions[requestedDomain] || fallbackOptions);
    }

    if (params.property) {
      setSelectedOption(toUiProperty(params.property));
    }

    setyearStart(params.yearStart || "");
    setyearEnd(params.yearEnd || "");
    const contextValue = params.contexts || params.context || "";
    setcontextID(parseContextIds(contextValue).join(","));
    setContextMode(params.contextMode === "any" ? "any" : "all");
    setdatasetID(params.dataset || "");
    setSelectedCountry(params.country || "");
  };

  const handleNlpSearch = async (termValue, domainValue) => {
    const availableSubdomains = Object.values(selectedCategory).flat().filter(Boolean);
    const countryNames = countries.map((country) => country.name).filter(Boolean);
    const llmResult = await parseNaturalLanguageSearchWithLlm({
      query: termValue,
      fallbackDomain: domainValue,
      fallbackProperty: selectedOption,
      availableSubdomains,
      countryNames
    });

    let parsed = llmResult.parsed;
    const summaryBits = [];
    const logBase = {
      database,
      input: termValue,
      fallback: {
        domain: domainValue,
        property: selectedOption
      },
      llm: {
        model: llmResult.model || "",
        status: llmResult.status,
        prompt: llmResult.prompt || "",
        output: llmResult.raw || "",
        errors: llmResult.errors || []
      }
    };
    let parserMode = "llm_validated_json";
    let resolutionDetails = {};

    const finalizeNlpResult = ({
      outcome,
      message,
      parsedPayload = parsed,
      finalQuery = {},
      validationErrors = []
    }) => {
      appendNlpLogEntry({
        ...logBase,
        parser_mode: parserMode,
        outcome,
        summary: message,
        parsed: parsedPayload,
        resolution: resolutionDetails,
        final_query: finalQuery,
        validation_errors: validationErrors
      });
      setNlpSummary(message);
    };

    if (llmResult.status === "ok") {
      summaryBits.push("Natural language request interpreted successfully.");
    } else {
      parserMode = "fallback_rule_parser";
      parsed = parseNaturalLanguageSearch({
        query: termValue,
        fallbackDomain: domainValue,
        fallbackProperty: selectedOption,
        availableSubdomains,
        countryNames
      });
      summaryBits.push("Used backup language parser for this request.");
    }

    let resolvedContextID = parsed.contextID || "";
    let resolvedDatasetID = parsed.datasetID || "";
    let resolvedCountryCode = "";

    if (parsed.contextTerm && !resolvedContextID && !resolvedDatasetID) {
      const normalizedContextDomain = String(parsed.contextDomain || "").toUpperCase();
      if (normalizedContextDomain === "DISTRICT") {
        const countryContextID = findCountryCode(parsed.contextTerm);
        if (countryContextID) {
          resolvedContextID = countryContextID;
          resolutionDetails = {
            status: "resolved_country_lookup",
            domain: "DISTRICT",
            context_term: parsed.contextTerm,
            cmid: countryContextID,
            matched_name: parsed.contextTerm,
            candidates: []
          };
          summaryBits.push(
            `Context "${parsed.contextTerm}" matched country-level (ADM0) as ${countryContextID}`
          );
        }
      }
    }

    if (parsed.contextTerm && !resolvedContextID && !resolvedDatasetID) {
      const resolutionDomain = parsed.contextDomain || "CATEGORY";
      const resolution = await resolveContextCmid({
        apiUrl: process.env.REACT_APP_API_URL,
        database,
        contextTerm: parsed.contextTerm,
        contextDomain: resolutionDomain
      });
      resolutionDetails = {
        status: resolution.status,
        domain: resolutionDomain,
        context_term: parsed.contextTerm,
        cmid: resolution.cmid || "",
        matched_name: resolution.matchedName || "",
        candidates: (resolution.candidates || []).slice(0, 5)
      };

      if (resolution.status === "resolved") {
        if (resolutionDomain === "DATASET") {
          resolvedDatasetID = resolution.cmid;
          summaryBits.push(
            `Dataset "${parsed.contextTerm}" resolved as ${resolution.cmid}`
          );
        } else {
          resolvedContextID = resolution.cmid;
          summaryBits.push(
            `Context "${parsed.contextTerm}" resolved in ${resolutionDomain} as ${resolution.cmid}`
          );
        }
      } else if (resolution.status === "ambiguous") {
        const candidateNames = resolution.candidates
          .slice(0, 3)
          .map((candidate) => candidate.CMName)
          .filter(Boolean)
          .join(", ");
        finalizeNlpResult({
          outcome: "blocked_ambiguous_context",
          message: `NLP needs clarification: context "${parsed.contextTerm}" is ambiguous in ${resolutionDomain}. Candidates: ${candidateNames || "none"}.`
        });
        return;
      } else if (resolutionDomain === "DISTRICT") {
        resolvedCountryCode = findCountryCode(parsed.contextTerm);
        if (resolvedCountryCode) {
          summaryBits.push(`Place "${parsed.contextTerm}" applied as country filter`);
        } else {
          finalizeNlpResult({
            outcome: "blocked_unresolved_place_context",
            message: `NLP could not resolve place context "${parsed.contextTerm}" in ${resolutionDomain}.`
          });
          return;
        }
      } else if (resolutionDomain === "DATASET") {
        finalizeNlpResult({
          outcome: "blocked_unresolved_dataset_context",
          message: `NLP could not resolve dataset context "${parsed.contextTerm}".`
        });
        return;
      } else {
        finalizeNlpResult({
          outcome: "blocked_unresolved_context",
          message: `NLP could not resolve context "${parsed.contextTerm}" in ${resolutionDomain}.`
        });
        return;
      }
    }

    const contextForQuery = resolvedContextID || "";
    const contextIdsForQuery = contextForQuery ? [contextForQuery] : [];
    const datasetForQuery = resolvedDatasetID || "";
    const countryForQuery = contextForQuery ? "" : resolvedCountryCode;

    const queryTerm = parsed.term;
    const hasSpecificDomain =
      Boolean(parsed.domain && parsed.domain.trim() !== "") &&
      parsed.domain !== "ALL NODES";

    if (!queryTerm && !parsed.intentAll && !hasSpecificDomain && !contextForQuery && !datasetForQuery) {
      finalizeNlpResult({
        outcome: "blocked_unclear_query",
        message: "NLP could not extract a clear term or domain. Please rephrase (for example: 'Find Yoruba in Ghana')."
      });
      return;
    }

    const nlpParams = {
      database,
      domain: parsed.domain || domainValue,
      property: parsed.property || selectedOption,
      term: queryTerm,
      yearStart: parsed.yearStart || "",
      yearEnd: parsed.yearEnd || "",
      contexts: contextIdsForQuery.join(","),
      contextMode: contextIdsForQuery.length > 1 ? "all" : "",
      dataset: datasetForQuery,
      country: countryForQuery
    };

    const validatedQuery = validateApiSearchParams({
      ...nlpParams,
      availableSubdomains,
      fallbackDomain: domainValue,
      fallbackProperty: selectedOption
    });

    if (!validatedQuery.valid) {
      const details = validatedQuery.errors.join(" ");
      finalizeNlpResult({
        outcome: "blocked_validation",
        message: `NLP query blocked by parameter validation. ${details}`,
        finalQuery: nlpParams,
        validationErrors: validatedQuery.errors
      });
      return;
    }

    const parsedSummaryParams = Object.fromEntries(
      Object.entries({
        term: queryTerm,
        domain: parsed.domain || domainValue,
        property: parsed.property || selectedOption,
        yearStart: parsed.yearStart,
        yearEnd: parsed.yearEnd,
        dataset: datasetForQuery,
        context_term: parsed.contextTerm,
        context_domain: parsed.contextDomain,
        contexts: contextIdsForQuery.join(","),
        country: parsed.countryName || countryForQuery,
        intent_all: parsed.intentAll ? "true" : ""
      }).filter(([_, value]) => value != null && value !== "")
    );

    const finalSummaryParams = Object.fromEntries(
      Object.entries(validatedQuery.params).filter(([_, value]) => value != null && value !== "")
    );

    const summaryDetails = [];
    if (finalSummaryParams.term) {
      summaryDetails.push(`Search term: "${finalSummaryParams.term}".`);
    }
    if (finalSummaryParams.domain && finalSummaryParams.domain !== "ALL NODES") {
      summaryDetails.push(`Domain: ${finalSummaryParams.domain}.`);
    }
    if (finalSummaryParams.country) {
      summaryDetails.push("Country filter applied.");
    }
    if (finalSummaryParams.context || finalSummaryParams.contexts) {
      summaryDetails.push("Context match applied.");
    }
    if (finalSummaryParams.dataset) {
      summaryDetails.push("Dataset filter applied.");
    }

    const summaryMessage = [...summaryBits, ...summaryDetails].join(" ");

    syncAdvancedControlsFromParams(validatedQuery.params);
    finalizeNlpResult({
      outcome: "applied",
      message: summaryMessage,
      parsedPayload: parsedSummaryParams,
      finalQuery: finalSummaryParams
    });
    applySearchParams(validatedQuery.params);
  };

  async function handleSearch(termValue, domainValue) {
    if (useNlpSearch) {
      setNlpProcessing(true);
      try {
        await handleNlpSearch(termValue, domainValue);
      } finally {
        setNlpProcessing(false);
      }
      return;
    }
    setNlpSummary("");
    const availableSubdomains = Object.values(selectedCategory).flat().filter(Boolean);
    const directParams = buildDirectSearchParams(termValue, domainValue);
    const validated = validateApiSearchParams({
      ...directParams,
      availableSubdomains,
      fallbackDomain: domainValue,
      fallbackProperty: selectedOption
    });
    if (!validated.valid) {
      setNlpSummary(`Search blocked by parameter validation. ${validated.errors.join(" ")}`);
      return;
    }
    syncAdvancedControlsFromParams(validated.params);
    applySearchParams(validated.params);
  }

  const handleSearchButtonClick = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    handleSearch(tvalue, advdomainDrop.trim());
  };

  React.useEffect(() => {
    runSearchRequest(searchParams);
  }, [searchParams]);

  React.useEffect(() => {
    if (!selectedCategory || Object.keys(selectedCategory).length === 0) return;
    const paramsObject = Object.fromEntries(searchParams.entries());
    if (!paramsObject || Object.keys(paramsObject).length === 0) return;
    syncAdvancedControlsFromParams(paramsObject);
  }, [searchParams, selectedCategory]);

  return (
    <div style={{ height: "auto" }}>
      <Box
        sx={{
          position: 'sticky',
          top: 90,
          zIndex: 9,
          p: 2,
          bgcolor: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
          color: 'white',
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", mb: 2, gap: 2 }}>
          <NeonButton
            type="infoOutlined"
            tooltipText={
              <>
                Explore all datasets and categories using the search bar. Use the advanced search to limit the search by domain or other criteria. Leave the search bar empty to return all results limited to the first 10,000 categories.{" "}
                <a href="https://catmapper.org/help/" target="_blank" rel="noopener noreferrer" style={{ color: "#0645AD !important", textDecoration: "underline" }}>
                  See for more information.
                </a>
              </>
            }
          />
          <input
            type="text"
            id="myInput"
            value={tvalue}
            style={{ flexGrow: 1, minWidth: 150, height: 45, padding: "0 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 16 }}
            placeholder={useNlpSearch ? "Try: look up Yoruba in Ghana" : "Search..."}
            onChange={(event) => {
              settvalue(event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleSearch(tvalue, advdomainDrop.trim())
              }
            }}
          />
          <NeonButton
            type="searchOutlined"
            onClick={handleSearchButtonClick}
          />
          {(loading || nlpProcessing) && (
            <div style={{ position: "absolute", top: "40vh", left: "50vw", transform: "translate(-50%, -50%)" }}>
              <CircularProgress />
            </div>
          )}
          <DownloadDialogButton users={users} database={database} domain={advdomainDrop} count={qcount} cmid_download={cmid_download} />
          <FormControlLabel
            sx={{
              marginLeft: 0.5,
              "& .MuiFormControlLabel-label": { color: "white" }
            }}
            control={
              <Switch
                size="small"
                color="success"
                checked={useNlpSearch}
                onChange={(event) => {
                  setUseNlpSearch(event.target.checked);
                  setNlpSummary("");
                }}
              />
            }
            label="NLP Search"
          />
          <Tooltip
            title={
              <div className="tooltip-width">
                NLP stands for <strong>Natural Language Processing</strong>.
                Turn this on to type a normal question, such as <em>look up Yoruba in Ghana</em>,
                and CatMapper will convert it into search filters for you.
                When multiple place levels exist, it prefers country-level (<strong>ADM0</strong>) matches.
              </div>
            }
            arrow
          >
            <Button
              startIcon={<InfoIcon sx={{ height: "28px", width: "28px" }} />}
              sx={{ minWidth: 36, color: "white" }}
            ></Button>
          </Tooltip>
          <Button
            onClick={handleAdvancedSearchChange} // Toggles your existing isChecked state
            startIcon={isChecked ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            disableRipple
            sx={{
              textTransform: "none", // Keeps natural capitalization like "Advanced Search"
              backgroundColor: "transparent",
              color: "white", // Adjust if your background is light
              fontSize: "14px", // Match your previous label size
              padding: "4px 8px",
              minWidth: "auto",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.08)", // Subtle hover effect
              },
            }}
          >
            Advanced Search
          </Button>
        </Box>
        {useNlpSearch && (
          <Typography variant="caption" sx={{ color: "white", display: "block", mb: 1 }}>
            {nlpSummary || "NLP search is enabled. Enter a natural language request."}
          </Typography>
        )}
        {useNlpSearch && (
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.75)", display: "block", mb: 1 }}>
            Temporary testing mode: NLP query JSON is saved automatically in this browser and on the server.
          </Typography>
        )}
        {isChecked && (
          <Box
            sx={{
              backgroundColor: "#000000",
              color: "white",
              borderRadius: 2,
              padding: 2,
              mt: 2,
            }}
          >
            <Grid container spacing={1}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormControl sx={{ width: 320 }} variant="standard" size="small">
                    <Typography variant="subtitle2" gutterBottom>Category Domain</Typography>
                    <NativeSelect
                      value={domainDrop}
                      label=""
                      sx={{
                        fontSize: 14, letterSpacing: 0.5, borderRadius: 1, backgroundColor: "white", "& .MuiNativeSelect-select": {
                          padding: "4px 8px",
                        },
                      }}
                      onChange={(event) => {
                        const newDomain = event.target.value;
                        const subdomains = selectedCategory[newDomain] || [];

                        setdomainDrop(newDomain);
                        setadvoptions(subdomains);
                        setadvdomainDrop(subdomains[0] || '');

                        const firstSub = subdomains[0];

                        if (firstSub) {
                          setoptionsForSelectedCategory(domainOptions[firstSub] || fallbackOptions || []);
                          setSelectedOption((domainOptions[firstSub] || fallbackOptions || [])[0] || '');
                        } else {
                          // fallback if no subdomain exists
                          setoptionsForSelectedCategory([]);
                          setSelectedOption('');
                        }
                      }}
                      input={<BootstrapInput />}
                    >
                      {Object.keys(selectedCategory).map((category, index) => (
                        <option key={index} value={category}>
                          {category === "DISTRICT" ? "AREA" : category}
                        </option>
                      ))}
                    </NativeSelect>
                  </FormControl>
                  <Tooltip title={tooltipContent} arrow>
                    <Button
                      startIcon={
                        <InfoIcon sx={{ height: "28px", width: "28px" }} />
                      }
                    ></Button>
                  </Tooltip>
                </Box>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormControl sx={{ width: 300 }} variant="standard">
                    <Typography variant="subtitle2" gutterBottom>Category Subdomain</Typography>
                    <NativeSelect
                      id="demo-customized-select-native"
                      value={advdomainDrop}
                      label=""
                      sx={{
                        fontSize: 14, letterSpacing: 0.5, borderRadius: 1, backgroundColor: "white", "& .MuiNativeSelect-select": {
                          padding: "4px 8px",
                        },
                      }}
                      onChange={(event) => {
                        setadvdomainDrop(event.target.value);
                        setoptionsForSelectedCategory(
                          domainOptions[event.target.value] || fallbackOptions || []
                        );
                      }}
                      input={<BootstrapInput />}
                    >
                      {advoptions.map((value, index) => (
                        <option key={index} value={value}>
                          {value === "DISTRICT" ? "AREA" : value}
                        </option>
                      ))}
                    </NativeSelect>
                  </FormControl>
                  <Tooltip title={tooltipContent2} arrow>
                    <Button
                      startIcon={
                        <InfoIcon sx={{ height: "28px", width: "28px" }} />
                      }
                    ></Button>
                  </Tooltip>
                </Box>
              </Grid>

              <Grid item xs={12} sm={4}>
                <FormControl sx={{ width: 250 }} variant="standard">
                  <Typography variant="subtitle2" gutterBottom>Country</Typography>
                  <NativeSelect
                    id="dropdown"
                    value={selectedcountry}
                    onChange={(event) => {
                      setSelectedCountry(event.target.value);
                    }}
                    sx={{
                      fontSize: 14, letterSpacing: 0.5, borderRadius: 1, backgroundColor: "white", "& .MuiNativeSelect-select": {
                        padding: "4px 8px",
                      },
                    }}
                    input={<BootstrapInput />}
                  >
                    {countries.map((country, index) => (
                      <option key={index} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </NativeSelect>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={3}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormControl sx={{ width: 250 }} variant="standard">
                    <Typography variant="subtitle2" gutterBottom>Property to Search</Typography>
                    <NativeSelect
                      id="dropdown"
                      value={selectedOption}
                      onChange={(event) => {
                        setSelectedOption(event.target.value);
                      }}
                      sx={{
                        fontSize: 14, letterSpacing: 0.5, borderRadius: 1, backgroundColor: "white", "& .MuiNativeSelect-select": {
                          padding: "4px 8px",
                        },
                      }}
                      input={<BootstrapInput />}
                    >
                      {optionsForSelectedCategory.map((option, index) => (
                        <option key={index} value={option}>
                          {option}
                        </option>
                      ))}
                    </NativeSelect>
                  </FormControl>
                  <Tooltip title={tooltipContent3} arrow>
                    <Button
                      startIcon={<InfoIcon sx={{ height: "28px", width: "28px" }} />}
                    ></Button>
                  </Tooltip>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl variant="standard">
                  <Typography variant="subtitle2" gutterBottom>Time Range</Typography>
                  <Box sx={{ display: 'flex', width: "100%", gap: 1, overflow: 'hidden' }}>
                    <input
                      type="text"
                      id="myInput"
                      placeholder='From'
                      value={yearStart}
                      maxLength={10}
                      className="flex-item-fixed"
                      onChange={(event) => {
                        setyearStart(event.target.value);
                      }}
                    />
                    <input
                      type="text"
                      id="myInput"
                      placeholder='To'
                      value={yearEnd}
                      maxLength={10}
                      className="flex-item-fixed"
                      onChange={(event) => {
                        setyearEnd(event.target.value);
                      }}
                    />
                  </Box>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl variant="standard">
                  <Typography variant="subtitle2" gutterBottom>Context ID(s)</Typography>
                  <input
                    type="text"
                    id="myInput"
                    value={contextID}
                    style={{ width: 160, height: 30, padding: "0 8px", borderRadius: 4, border: "1px solid #ccc" }}
                    onChange={(event) => {
                      setcontextID(event.target.value);
                    }}
                  />
                  <Typography variant="caption" sx={{ mt: 0.5 }}>
                    Multiple IDs: separate with comma
                  </Typography>
                  <NativeSelect
                    value={contextMode}
                    sx={{
                      mt: 0.5,
                      width: 120,
                      fontSize: 14,
                      letterSpacing: 0.5,
                      borderRadius: 1,
                      backgroundColor: "white",
                      "& .MuiNativeSelect-select": {
                        padding: "4px 8px",
                      },
                    }}
                    onChange={(event) => {
                      setContextMode(event.target.value === "any" ? "any" : "all");
                    }}
                    input={<BootstrapInput />}
                  >
                    <option value="all">all contexts</option>
                    <option value="any">any context</option>
                  </NativeSelect>
                </FormControl>
              </Grid>


              <Grid >
                <FormControl variant="standard">
                  <Typography variant="subtitle2" gutterBottom>Dataset ID</Typography>
                  <input
                    type="text"
                    id="myInput"
                    value={datasetID}
                    style={{ width: 100, height: 30, padding: "0 8px", borderRadius: 4, border: "1px solid #ccc" }}
                    onChange={(event) => {
                      setdatasetID(event.target.value);
                    }}
                  />
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <NeonButton label="Reset" onClick={handleReset} />
              </Grid>

            </Grid>
          </Box>
        )}
      </Box>
      <div style={{ padding: 10, backgroundColor: "black" }}>
        <Box sx={{ width: "100%", color: "black", backgroundColor: "white" }}>
          {
            <DataTable
              users={users}
              label={domainDrop}
              snackbarOpen={snackbarOpen}
              setSnackbarOpen={setSnackbarOpen}
              database={database}
            />
          }
        </Box>
      </div>
    </div>
  );

}

//export default Searchbar
