import React, { Component } from "react";
import styled, { createGlobalStyle, ThemeProvider } from 'styled-components';

import SpotifyWebApi from "spotify-web-api-js";
const spotifyApi = new SpotifyWebApi();


/* ======================================== *\
   APP
\* ======================================== */

class App extends Component {
  constructor(props) {
    super(props);
    
    const params = this.getHashParams();
    const token = params.access_token;
    
    if (token)
      spotifyApi.setAccessToken(token);

    this.state = {
      loggedIn: token ? true : false,
      nowPlaying: {
        name: "",
        artists: [],
        albumArt: ""
      }
    };
  }

  getHashParams = () => {
    const hashParams = {};
    const r = /([^&;=]+)=?([^&;]*)/g;
    const q = window.location.hash.substring(1);
    let e = r.exec(q);
    while (e) {
      hashParams[e[1]] = decodeURIComponent(e[2]);
      e = r.exec(q);
    }
    return hashParams;
  };

  getNowPlaying = () => {
    spotifyApi
      .getMyCurrentPlaybackState()
      .then(res => {
        console.log(res);
        let { name, artists, album } = res.item;
        this.setState({
          nowPlaying: {
            name,
            artists: artists.map(a => a.name),
            albumArt: album.images[0].url,
          }
        });
      })
      .catch(err => console.error(err));
  };

  componentDidMount = () => {
    this.getNowPlaying();
  };

  handleRefreshClick = (e) => {
    e.preventDefault();
    this.getNowPlaying();
  };

  render() {
    const { loggedIn } = this.state;
    const { name, artists, albumArt } = this.state.nowPlaying;
    
    const nowPlayingEl = (
      <NowPlaying>
        <AlbumArt><img src={albumArt} alt="" /></AlbumArt>
        <SongDetails>
          <p><strong>Artist:</strong> {artists.join(', ')}</p>
          <p><strong>Song:</strong> {name}</p>
        </SongDetails>
      </NowPlaying>
    );

    return (
      <ThemeProvider theme={theme}>
        <Wrapper>
          <GlobalStyle />
          {!loggedIn ? (
            <LoginRefresh>
              <Button href="http://localhost:8888" login>Login to Spotify</Button>
            </LoginRefresh>
          ) : (
            <LoginRefresh>
              <Button onClick={this.handleRefreshClick}>Refresh Feed</Button>
            </LoginRefresh>
          )}
          {loggedIn && nowPlayingEl}
        </Wrapper>
      </ThemeProvider>
    );
  }
}

export default App;

/* ======================================== *\
   STYLES
\* ======================================== */

const theme = {
  white: 'white',
  primary: 'dodgerblue',
  secondary: 'orange',
  albumH: '30rem',
  maxW: '30rem',
  padX: '0 1.rem',
  padY: '1rem 0',
};

const GlobalStyle = createGlobalStyle`
  html {
    font-size: 62.5%;
  }
  body {
    -moz-osx-font-smoothing: grayscale;
    -webkit-font-smoothing: antialiased;
    background: black;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
    font-size: 1.6rem;
    margin: 0;
    padding: 0;
  }

  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, "Courier New",
      monospace;
  }
`;

const Wrapper = styled.div`
  max-width: 1000px;
  margin: 2rem auto;
  padding: ${({theme}) => theme.padX}
`;

const LoginRefresh = styled.div`
  max-width: ${({theme}) => theme.maxW};
  margin: 2rem auto 1rem;
  padding: ${({theme}) => theme.padY};
  text-align: center;
`;

const Button = styled.a`
  background: ${({theme}) => theme.white};
  border-radius: 4px;
  color: black;
  cursor: pointer;
  display: inline-block;
  font-size: 2rem;
  font-weight: 600;
  line-height: 1;
  padding: ${({theme}) => theme.padY};
  position: relative;
  text-decoration: none;
  transition: all 200ms ease-out;
  transition: all 200ms ease;
  width: 100%;

  &:hover {
    background: ${({theme, login}) => login ? theme.primary : theme.secondary};
  }
`;

const NowPlaying = styled.div`
  padding: ${({theme}) => theme.padY};
  max-width: ${({theme}) => theme.maxW};
  margin: 0 auto;
`;

const AlbumArt = styled.div`
  margin-bottom: 2rem;

  img {
    height: ${({theme}) => theme.albumH};
    width: 100%;
  }
`;

const SongDetails = styled.div`
  p {
    color: ${({theme}) => theme.white}
    font-size: 2rem;
    margin: 0 0 .5rem;
  }

  strong {
    color: ${({theme}) => theme.secondary}
  }
`;
