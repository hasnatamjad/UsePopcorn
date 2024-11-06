import { useEffect, useState } from "react";
import StarRating from "./StarRating";

// http://www.omdbapi.com/?i=tt3896198&apikey=b69222f7

const movieKey = "b69222f7";
const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export default function App() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsloading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const [selectedId, setSelectedId] = useState(null);
  const [watched, setWatched] = useState(function () {
    const storeItem = localStorage.getItem("watched");
    return JSON.parse(storeItem);
  });
  const [movieAdded, setMovieAdded] = useState(false);

  function handleSelectedMovie(id) {
    setSelectedId((selectedId) => (id === selectedId ? null : id));
  }

  function closeMovie() {
    setSelectedId(null);
  }

  function handleAddWatch(movie) {
    setWatched((watched) => [...watched, movie]);
    // localStorage.setItem("watched", JSON.stringify([...watched, movie]));
  }
  function handleMovieAdded() {
    setMovieAdded(true);
  }

  function handleDeleteWatched(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbId !== id));
  }

  useEffect(
    function () {
      localStorage.setItem("watched", JSON.stringify(watched));
    },
    [watched]
  );

  useEffect(
    function () {
      const controller = new AbortController();

      async function fetchMovies() {
        try {
          setIsloading(true);
          setError("");
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${movieKey}&s=${query}`,
            { signal: controller.signal }
          );
          if (!res.ok)
            throw new Error("Something went wrong while loading movie");

          const data = await res.json();
          if (data.Response === "False") throw new Error("Movie Not Found🚫");
          setMovies(data.Search);
          setError("");
        } catch (err) {
          if (err.name !== "AbortError") {
            console.log(err.message);
            setError(err.message);
          }
        } finally {
          setIsloading(false);
        }
      }

      if (query.length < 3) {
        setMovies([]);
        setError("");
        return;
      } else {
        closeMovie();
        fetchMovies();

        return function () {
          controller.abort();
        };
      }
    },
    [query]
  );

  return (
    <>
      <Navbar movies={movies} query={query} setQuery={setQuery} />
      <Main>
        <Box>
          {/* {isLoading ? <Loader /> : <MoviesList movies={movies} />} */}
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <MoviesList
              movies={movies}
              onSelectedMovie={handleSelectedMovie}
              onCloseMovie={closeMovie}
            />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>

        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              onCloseMovie={closeMovie}
              onAddWatch={handleAddWatch}
              watched={watched}
            />
          ) : (
            <>
              <Summary watched={watched} />

              <WatchedList
                watched={watched}
                onDeleteWatched={handleDeleteWatched}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function ErrorMessage({ message }) {
  return (
    <div className="error">
      <div class="card">
        <svg
          class="wave"
          viewBox="0 0 1440 320"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,256L11.4,240C22.9,224,46,192,69,192C91.4,192,114,224,137,234.7C160,245,183,235,206,213.3C228.6,192,251,160,274,149.3C297.1,139,320,149,343,181.3C365.7,213,389,267,411,282.7C434.3,299,457,277,480,250.7C502.9,224,526,192,549,181.3C571.4,171,594,181,617,208C640,235,663,277,686,256C708.6,235,731,149,754,122.7C777.1,96,800,128,823,165.3C845.7,203,869,245,891,224C914.3,203,937,117,960,112C982.9,107,1006,181,1029,197.3C1051.4,213,1074,171,1097,144C1120,117,1143,107,1166,133.3C1188.6,160,1211,224,1234,218.7C1257.1,213,1280,139,1303,133.3C1325.7,128,1349,192,1371,192C1394.3,192,1417,128,1429,96L1440,64L1440,320L1428.6,320C1417.1,320,1394,320,1371,320C1348.6,320,1326,320,1303,320C1280,320,1257,320,1234,320C1211.4,320,1189,320,1166,320C1142.9,320,1120,320,1097,320C1074.3,320,1051,320,1029,320C1005.7,320,983,320,960,320C937.1,320,914,320,891,320C868.6,320,846,320,823,320C800,320,777,320,754,320C731.4,320,709,320,686,320C662.9,320,640,320,617,320C594.3,320,571,320,549,320C525.7,320,503,320,480,320C457.1,320,434,320,411,320C388.6,320,366,320,343,320C320,320,297,320,274,320C251.4,320,229,320,206,320C182.9,320,160,320,137,320C114.3,320,91,320,69,320C45.7,320,23,320,11,320L0,320Z"
            fill-opacity="1"
          ></path>
        </svg>

        <div class="icon-container">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            stroke-width="0"
            fill="currentColor"
            stroke="currentColor"
            class="icon"
          >
            <path d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c-9.4 9.4-9.4 24.6 0 33.9l47 47-47 47c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l47-47 47 47c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-47-47 47-47c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-47 47-47-47c-9.4-9.4-24.6-9.4-33.9 0z"></path>
          </svg>
        </div>
        <div class="message-text-container">
          <p class="message-text"> {message}</p>
          <p class="sub-text">Search Again</p>
        </div>
      </div>
    </div>
  );
}

function Loader() {
  return (
    <div className="loader">
      <section class="dots-container">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </section>
    </div>
  );
}

/* =============================================== */

// child of Navbar Component
function Logo() {
  return (
    <div>
      <div className="logo">
        <span role="img">🍿</span>
        <h1>usePopcorn</h1>
      </div>
    </div>
  );
}

// Navbar Component
function Navbar({ movies, query, setQuery }) {
  useEffect(function () {
    const el = document.querySelector(".search");
    el.focus();
  }, []);
  return (
    <div>
      <nav className="nav-bar">
        <Logo />
        <input
          className="search"
          type="text"
          placeholder="Search movies..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <p className="num-results">
          Found <strong>{movies.length}</strong> results
        </p>
      </nav>
    </div>
  );
}

/* =============================================== */

// Main Component
function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function MoviesList({ movies, onSelectedMovie, onCloseMovie }) {
  const filterWords = ["sex", "drug", "porn"];
  const [showMovie, setShowMovie] = useState(false);

  const [filteredMovies, setFilteredMovies] = useState([]);

  // useEffect(() => {
  //   const filtered = movies
  //     .filter((item) => {
  //       const title = item.Title.toLowerCase();
  //       return filterWords.some((word) => title.split(" ").includes(word));
  //     })
  //     .map((movie) => movie.imdbID);

  //   setFilteredMovies(filtered);
  // }, [movies, filterWords, filteredMovies, setFilteredMovies]);

  return (
    <ul className="list">
      {movies?.map((movie) => (
        <Movie
          movie={movie}
          key={movie.imdbID}
          onSelectedMovie={onSelectedMovie}
          onCloseMovie={onCloseMovie}
        />
      ))}
    </ul>
  );
}

function Movie({ movie, showMovie, onSelectedMovie, onCloseMovie }) {
  return (
    <li onClick={() => onSelectedMovie(movie.imdbID)}>
      {showMovie ? (
        <span>Explicit Content🛑 Content is Hidden</span>
      ) : (
        <>
          <img src={movie.Poster} alt={`${movie.Title} poster`} />
          <h3>{movie.Title}</h3>
          <div>
            <p>
              <span>🗓</span>
              <span>{movie.Year}</span>
            </p>
          </div>
        </>
      )}
    </li>
  );
}

function MovieDetails({ selectedId, onCloseMovie, onAddWatch, watched }) {
  const [movieData, setMovieData] = useState({});
  const [movieDataLoading, setMovieDataLoading] = useState(false);
  const [userRating, setUserRating] = useState("");

  const {
    Title: title,
    Poster: poster,
    Year: year,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movieData;
  useEffect(
    function () {
      async function getMovieDetails() {
        setMovieDataLoading(true);
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${movieKey}&i=${selectedId}`
        );
        const data = await res.json();
        setMovieData(data);
        setMovieDataLoading(false);
      }
      getMovieDetails();
    },
    [selectedId]
  );

  const isWatched = watched.map((movie) => movie.imdbId).includes(selectedId);
  const watchedUserRating = watched.find(
    (movie) => movie.imdbId === selectedId
  )?.userRating;

  function handleAdd(movie) {
    const newWatchedMovie = {
      imdbId: selectedId,
      title,
      poster,
      year,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
    };
    onAddWatch(newWatchedMovie);
    onCloseMovie();
  }

  useEffect(
    function () {
      function callBack(e) {
        if (e.code === "Escape") {
          onCloseMovie();
        }
      }
      document.addEventListener("keydown", callBack);

      return function () {
        document.removeEventListener("keydown", callBack);
      };
    },
    [onCloseMovie]
  );

  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie | ${title}`;

      return function () {
        document.title = "usePopcorn";
      };
    },
    [title]
  );

  return (
    <div className="details">
      {movieDataLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <img src={poster} alt={`poster of ${title}`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐</span>
                {imdbRating} IMDB Rating{" "}
              </p>
            </div>
            <button className="btn-back" onClick={onCloseMovie}>
              &larr;
            </button>
          </header>
          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    size="20"
                    onSetRating={setUserRating}
                  />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleAdd}>
                      Add To WatchList
                    </button>
                  )}
                </>
              ) : (
                <p>You rated the movie with {watchedUserRating} 🌟 </p>
              )}
            </div>

            <p>
              <em>{plot}</em>
            </p>
            <p>
              <strong>Staring: </strong>
              {actors}
            </p>
            <p>
              <strong>Director: </strong>
              {director}
            </p>
          </section>
        </>
      )}
    </div>
  );
}

function Summary({ watched }) {
  const newImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgImdbRating = newImdbRating.toFixed(1);
  const newUserRating = average(watched.map((movie) => movie.userRating));
  const avgUserRating = newUserRating.toFixed(1);
  const newRuntime = average(watched.map((movie) => movie.runtime));
  const avgRuntime = newRuntime.toFixed(1);

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedList({ watched, onDeleteWatched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie movie={movie} onDeleteWatched={onDeleteWatched} />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie, onDeleteWatched }) {
  return (
    <>
      <li key={movie.imdbId}>
        <img src={movie.poster} alt={`${movie.title} poster`} />
        <h3>{movie.title}</h3>
        <div>
          <p>
            <span>⭐️</span>
            <span>{movie.imdbRating}</span>
          </p>
          <p>
            <span>🌟</span>
            <span>{movie.userRating}</span>
          </p>
          <p>
            <span>⏳</span>
            <span>{movie.runtime} min</span>
          </p>
          <button
            className="btn-delete"
            onClick={() => onDeleteWatched(movie.imdbId)}
          >
            X
          </button>
        </div>
      </li>
    </>
  );
}
