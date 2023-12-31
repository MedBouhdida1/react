import * as React from "react";
import axios from "axios";
import './App.css'
import styled from 'styled-components'
import _ from 'lodash';

const storiesReducer = (state, action) => {
  switch (action.type) {
    case "STORIES_FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "STORIES_FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case "STORIES_FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    case "REMOVE_STORY":
      return {
        ...state,
        data: state.data.filter(
          (story) => action.payload.objectID !== story.objectID,
        ),
      };
    default:
      throw new Error();
  }
};
const useStorageState = (key, initialState) => {
  const isMounted = React.useRef(false);
  const [value, setValue] = React.useState(
    localStorage.getItem(key) || initialState,
  );

  React.useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
    } else {
      localStorage.setItem(key, value);
    }
  }, [value, key]);

  return [value, setValue];
};

const API_ENDPOINT = "https://hn.algolia.com/api/v1/search?query=";

const App = () => {
  const [searchTerm, setSearchTerm] = useStorageState("search", "React");
  const [url, setUrl] = React.useState(`${API_ENDPOINT}${searchTerm}`);
  const [urls, setUrls] = React.useState([]);
  const [stories, dispatchStories] = React.useReducer(storiesReducer, {
    data: [],
    isLoading: false,
    isError: false,
  });
  const [page, setPage] = React.useState(0);

  const handleFetchStories = React.useCallback(async () => {
    dispatchStories({ type: "STORIES_FETCH_INIT" });

    try {
      const result = await axios.get(`${url}&page=${page}`, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      });

      dispatchStories({
        type: "STORIES_FETCH_SUCCESS",
        payload: [...stories.data, ...result.data.hits],
      });
    } catch {
      dispatchStories({ type: "STORIES_FETCH_FAILURE" });
    }
  }, [url, page]);

  React.useEffect(() => {
    handleFetchStories();
  }, [handleFetchStories]);

  const handleRemoveStory = (item) => {
    dispatchStories({
      type: "REMOVE_STORY",
      payload: item,
    });
  };

  const handleSearchInput = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const newUrl = `${API_ENDPOINT}${searchTerm}`;

    setUrls(oldUrls => {
      const filteredUrls = oldUrls.filter(url => url !== newUrl);
      return [newUrl, ...filteredUrls].slice(0, 5);
    });

    setUrl(newUrl);
    setPage(0); // Reset page to 0 for a new search
  };

  const handleLoadMore = () => {
    setPage((prevPage) => prevPage + 1);
  };

  return (
    <StyledContainer>
      <StyledHeadlinePrimary>My Hacker Stories</StyledHeadlinePrimary>

      <SearchForm
        searchTerm={searchTerm}
        onSearchInput={handleSearchInput}
        onSearchSubmit={handleSearchSubmit}
      />
      <SearchHistoryButtons urls={urls} setUrl={setUrl} />

      <hr />

      {stories.isError && <p>Something went wrong ...</p>}

      {stories.isLoading ? (
        <p>Loading ...</p>
      ) : (
        <>
          <List list={stories.data} onRemoveItem={handleRemoveStory} />
          <button onClick={handleLoadMore}>Load More</button>
        </>
      )}
    </StyledContainer>

  );
};
const SearchHistoryButtons = ({ urls, setUrl }) => {
  const handleClick = (url) => {
    setUrl(url);
  };

  return (
    <div>
      {urls.map((url, index) => (
        <button key={index} onClick={() => handleClick(url)}>
          {url.split('?query=')[1]}
        </button>
      ))}
    </div>
  );
};
const SearchForm = ({ searchTerm, onSearchInput, onSearchSubmit }) => (
  <StyledSearchForm onSubmit={onSearchSubmit}>
    <InputWithLabel
      id="search"
      value={searchTerm}
      isFocused
      onInputChange={onSearchInput}
    >
      <strong>Search:</strong>
    </InputWithLabel>

    <button type="submit" disabled={!searchTerm}>
      Submit
    </button>
  </StyledSearchForm>
);

const InputWithLabel = ({
  id,
  value,
  type = "text",
  onInputChange,
  isFocused,
  children,
}) => {
  const inputRef = React.useRef();

  React.useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  return (
    <>
      <StyledLabel htmlFor={id}>{children}</StyledLabel>
      &nbsp;
      <StyledInput
        ref={inputRef}
        id={id}
        type={type}
        value={value}
        onChange={onInputChange}
      />
    </>
  );
};

const List = ({ list, onRemoveItem }) => {
  const [sortedList, setSortedList] = React.useState(list);
  const [sortOrder, setSortOrder] = React.useState({
    title: 'asc',
    author: 'asc',
    num_comments: 'asc',
    points: 'asc',
  });

  const handleSort = (columnName) => {
    const order = sortOrder[columnName] === 'asc' ? 'desc' : 'asc';

    const sorted = _.orderBy(sortedList, [columnName], [order]);

    setSortedList(sorted);
    setSortOrder({ ...sortOrder, [columnName]: order });
  };
  return (
    <div>
      <ul>
        <StyledItem>
          <StyledColumn width="40%">
            <StyledButtonLarge type="button" onClick={() => handleSort('title')}>
              Title
            </StyledButtonLarge>
          </StyledColumn>
          <StyledColumn width="30%">
            <StyledButtonLarge type="button" onClick={() => handleSort('author')}>
              Author
            </StyledButtonLarge>
          </StyledColumn>
          <StyledColumn width="10%">
            <StyledButtonLarge type="button" onClick={() => handleSort('num_comments')}>
              Num comments
            </StyledButtonLarge>
          </StyledColumn>
          <StyledColumn width="10%">
            <StyledButtonLarge type="button" onClick={() => handleSort('points')}>
              Points
            </StyledButtonLarge>
          </StyledColumn>

        </StyledItem>
      </ul>

      <ul>
        {sortedList.map((item) => (
          <Item key={item.objectID} item={item} onRemoveItem={onRemoveItem} />
        ))}
      </ul>
    </div>
  );
};
const StyledContainer = styled.div`
      height: 100vw;
      padding: 20px;
      background: #83a4d4;
      background: linear-gradient(to left,
      #b6fbff, #83a4d4);
      color: #171212;
      `;
const StyledHeadlinePrimary =
  styled.h1`
      font-size: 48px;
      font-weight: 300;
      letter-spacing: 2px;
      `;
const StyledItem = styled.li`
      display: flex;
      align-items: center;
      padding-bottom: 5px;
      `;
const StyledColumn = styled.span`
      padding: 0 5px;
      white-space: nowrap;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      a {
      color: inherit;
      }
      width: ${(props) => props.width};
      `;
const StyledButton =
  styled.button`
      background: transparent;
      border: 1px solid #171212;
      padding: 5px;
      cursor: pointer;
      transition: all 0.1s ease-in;
      &:hover {
      background: #171212;
      color: #ffffff;
      }
      `;

const StyledButtonSmall =
  styled(StyledButton)`
      padding: 5px;
      `;
const StyledButtonLarge =
  styled(StyledButton)`
      padding: 10px;
      `;
const StyledSearchForm = styled.form`
      padding: 10px 0 20px 0;
      display: flex;
      align-items: baseline;
      `;
const StyledLabel
  = styled
    .label
    `
      border
      -top: 1px solid #171212;
      border
      -left: 1px solid #171212;
      padding
      -left: 5px;
      font
      -size: 24px;
      `;
const StyledInput
  = styled
    .input
    `
      border: none;
      border
      -bottom: 1px solid #171212;
      background
      -color: transparent;
      font
      -size: 24px;
      `;

const Item = ({ item, onRemoveItem }) => (
  <StyledItem>
    <StyledColumn width="40%">
      <a href={item.url}>{item.title}</a>
    </StyledColumn>
    <StyledColumn width="30%">{item.author}</StyledColumn>
    <StyledColumn width="10%">{item.num_comments}</StyledColumn>
    <StyledColumn width="10%">{item.points}</StyledColumn>
    <StyledColumn width="10%">
      <StyledButtonSmall type="button" onClick={() =>
        onRemoveItem(item)}>
        Dismiss
      </StyledButtonSmall>
    </StyledColumn>
  </StyledItem>
);

/*const Item = ({item, onRemoveItem}) => (
      <li>
        <span>
          <a href={item.url}>{item.title}</a>
        </span>
        <span>{item.author}</span>
        <span>{item.num_comments}</span>
        <span>{item.points}</span>
        <span>
          <button type="button" onClick={() => onRemoveItem(item)}>
            Dismiss
          </button>
        </span>
      </li>
      );*/

export default App;
export {
  storiesReducer,
  SearchForm, InputWithLabel,
  List, Item
};
