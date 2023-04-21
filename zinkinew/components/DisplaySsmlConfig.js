import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';

function DisplaySsmlConfig() {
    const [data, setData] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await fetch('http://192.168.1.16:3000/GenerateSSML/test');
            const json = await response.json();
            setData(json);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <View>
            {data ? (
                <Text>{JSON.stringify(data)}</Text>
            ) : (
                <Text>Loading...</Text>
            )}
        </View>
    );
}

export default DisplaySsmlConfig;
