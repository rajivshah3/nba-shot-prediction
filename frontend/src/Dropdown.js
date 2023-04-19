import React, { useState, useEffect } from 'react';

const Dropdown = ({ source }) => {
    const [data, setData] = useState([]);
    const [selected, setSelected] = useState('');

    useEffect(() => {
        fetchData(source);
    }, []);

    const fetchData = async (path) => {
        const API_URL = "https://pj23k7u4lg.execute-api.us-east-1.amazonaws.com/prod"
        try {
            const response = await fetch(`${API_URL}/${path}`);
            const data = await response.json();
            setData(data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleChange = (e) => {
        setSelected(e.target.value);
    };

    return (
        <select value={selected} onChange={handleChange}>
            <option>Select an option</option>
            {data.map((item, index) => (
                <option key={index} value={item.value}>
                    {item.label}
                </option>
            ))}
        </select>
    );
};

export default Dropdown;
