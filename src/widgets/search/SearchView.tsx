'use client'

import { View } from '@vkontakte/vkui';
import { SearchMainPanel } from './panels/SearchMainPanel';
import { SEARCH_PANEL_IDS } from '@/shared/config/navigation';
import React from "react";

interface SearchViewProps {
    id: string,
}

export const SearchView : React.FC<SearchViewProps> = ({ id }) => {
    return (
        <View id={id} activePanel={SEARCH_PANEL_IDS.MAIN}>
            <SearchMainPanel id={SEARCH_PANEL_IDS.MAIN} />
        </View>
    );
};

export default SearchView;
