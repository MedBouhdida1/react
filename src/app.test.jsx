
import { describe, it, expect, vi } from
    "vitest";

import axios from 'axios';
vi.mock('axios');

import App, {
    storiesReducer,
    Item,
    List,
    SearchForm,
    InputWithLabel,
} from "./App";
import {
    render,
    screen,
    fireEvent,
    waitFor,
} from '@testing-library/react';


const storyOne = {
    title: 'React',
    url: 'https://reactjs.org/',
    author: 'Jordan Walke',
    num_comments: 3,
    points: 4,
    objectID: 0,
};
const storyTwo = {
    title: 'Redux',
    url: 'https://redux.js.org/',
    author: 'Dan Abramov, Andrew Clark',
    num_comments: 2,
    points: 5,
    objectID: 1,
};

const stories = [storyOne, storyTwo];


describe('storiesReducer', () => {
    it('removes a story from all stories', () => {
        const action = { type: 'REMOVE_STORY', payload: storyOne };
        const state = { data: stories, isLoading: false, isError: false };
        const newState = storiesReducer(state, action);
        const expectedState = {
            data: [storyTwo],
            isLoading: false,
            isError: false,
        };
        expect(newState).toStrictEqual(expectedState);
    });
});


describe('Item'
    , () => {
        it('renders all properties'
            , () => {
                render(<Item item={storyOne} />);
                expect(screen.getByText('Jordan Walke')).toBeInTheDocument();
                expect(screen.getByText('React')).toHaveAttribute(
                    'href'
                    ,
                    'https://reactjs.org/'
                );
            });
    });

describe('Item'
    , () => {
        it('clicking the dismiss button calls the callback handler'
            , () => {
                const handleRemoveItem = vi.fn();
                render(<Item item={storyOne} onRemoveItem={handleRemoveItem} />);
                fireEvent.click(screen.getByRole('button'));
                expect(handleRemoveItem).toHaveBeenCalledTimes(1);
            });
    });



// describe('SearchForm'
//     , () => {
//         it('renders the input field with its value'
//             , () => {
//                 render(<SearchForm {...searchFormProps} />);
//                 expect(screen.getByDisplayValue('React')).toBeInTheDocument();
//             });
//         it('renders the correct label'
//             , () => {
//                 render(<SearchForm {...searchFormProps} />);
//                 expect(screen.getByLabelText(/Search/)).toBeInTheDocument();
//             });
//         it('calls onSearchInput on input field change'
//             , () => {
//                 render(<SearchForm {...searchFormProps} />);
//                 fireEvent.change(screen.getByDisplayValue('React'), {
//                     target: { value: 'Redux' },
//                 });
//                 expect(searchFormProps.onSearchInput).toHaveBeenCalledTimes(1);
//             });
//         it('calls onSearchSubmit on button submit click'
//             , () => {
//                 render(<SearchForm {...searchFormProps} />);
//                 fireEvent.submit(screen.getByRole('button'));
//                 expect(searchFormProps.onSearchSubmit).toHaveBeenCalledTimes(1);
//             });


//     });

describe('App', () => {
    it('succeeds fetching data', async () => {
        const promise = Promise.resolve({
            data: {
                hits: stories,
            },
        });
        axios.get.mockImplementationOnce(() => promise);
        render(<App />);
        expect(screen.queryByText(/Loading/)).toBeInTheDocument();
        await waitFor(async () => await promise);
        expect(screen.queryByText(/Loading/)).toBeNull();
    });
});


describe('App', () => {
    it('renders snapshot', () => {
        const { container } = render(<App />);
        expect(container.firstChild).toMatchSnapshot();
    });
});
