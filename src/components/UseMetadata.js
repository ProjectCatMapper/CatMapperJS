// useMetadata.js
import { useState, useEffect } from 'react';

export const useMetadata = (database) => {
    const [infodata, setInfodata] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMetadata = async () => {
            if (!database) return;

            setLoading(true);
            setError(null);

            try {
                const dbParam = database.toLowerCase();
                const response = await fetch(
                    `${process.env.REACT_APP_API_URL}/metadata/domainDescriptions/${dbParam}`
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setInfodata(data);
            } catch (err) {
                console.error("Error fetching metadata:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMetadata();
    }, [database]);

    return { infodata, loading, error };
};