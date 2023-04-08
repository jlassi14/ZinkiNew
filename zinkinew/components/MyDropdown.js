import React, { useState } from 'react';
import { View } from 'react-native';
import { Dropdown, Menu, Divider } from 'react-native-paper';

const MyDropdown = () => {
    const [visible, setVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState('');

    const showMenu = () => setVisible(true);
    const hideMenu = () => setVisible(false);

    const onItemPress = (item) => {
        setSelectedItem(item);
        hideMenu();
    };

    return (
        <View>
            <Dropdown
                label="Select item"
                value={selectedItem}
                visible={visible}
                onDismiss={hideMenu}
                dropdownOffset={{ top: 8 }}
                onPress={showMenu}
            />
            <Menu
                visible={visible}
                onDismiss={hideMenu}
                anchor={<></>}
                contentStyle={{ marginTop: 35 }}
            >
                <Menu.Item onPress={() => onItemPress('Item 1')} title="Item 1" />
                <Divider />
                <Menu.Item onPress={() => onItemPress('Item 2')} title="Item 2" />
                <Divider />
                <Menu.Item onPress={() => onItemPress('Item 3')} title="Item 3" />
            </Menu>
        </View>
    );
};

export default MyDropdown;
