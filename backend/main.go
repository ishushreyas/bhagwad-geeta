package main

import (
    "fmt"
    "database/sql"
    "encoding/json"
    "log"
    "net/http"
    "os"

    "github.com/joho/godotenv"
    _ "github.com/lib/pq"
    "github.com/gorilla/mux"
)

var (
	db *sql.DB
)

// Verse represents the verse table structure
type Verse struct {
    ID              string        `json:"id"`
    Chapter         *int          `json:"chapter,omitempty"`
    VerseNumber     *int          `json:"verse,omitempty"`
    Slok            *string       `json:"slok,omitempty"`
    Transliteration *string       `json:"transliteration,omitempty"`
    Commentaries    []Commentary  `json:"commentaries,omitempty"`
}

// Commentary represents the commentary table structure
type Commentary struct {
    VerseID            string  `json:"verse_id"`
    Commentator        string  `json:"commentator"`
    Author             *string `json:"author,omitempty"`
    EnglishTranslation *string `json:"english_translation,omitempty"`
    EnglishCommentary  *string `json:"english_commentary,omitempty"`
    SanskritCommentary *string `json:"sanskrit_commentary,omitempty"`
    HindiTranslation   *string `json:"hindi_translation,omitempty"`
    HindiCommentary    *string `json:"hindi_commentary,omitempty"`
}

// GetVerseWithComments retrieves a verse and its comments by verse ID
func GetVerseWithComments(db *sql.DB, verseID string) (*Verse, error) {
    // First get the verse
    verse := &Verse{}
    err := db.QueryRow(`
        SELECT id, chapter, verse, slok, transliteration 
        FROM verses 
        WHERE id = $1
    `, verseID).Scan(
        &verse.ID,
        &verse.Chapter,
        &verse.VerseNumber,
        &verse.Slok,
        &verse.Transliteration,
    )
    if err != nil {
        if err == sql.ErrNoRows {
            return nil, nil
        }
        return nil, err
    }

    // Then get all commentaries for this verse
    rows, err := db.Query(`
        SELECT 
            verse_id,
            commentator,
            author,
            english_translation,
            english_commentary,
            sanskrit_commentary,
            hindi_translation,
            hindi_commentary
        FROM commentaries
        WHERE verse_id = $1
    `, verseID)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    verse.Commentaries = []Commentary{}
    for rows.Next() {
        var comm Commentary
        err := rows.Scan(
            &comm.VerseID,
            &comm.Commentator,
            &comm.Author,
            &comm.EnglishTranslation,
            &comm.EnglishCommentary,
            &comm.SanskritCommentary,
            &comm.HindiTranslation,
            &comm.HindiCommentary,
        )
        if err != nil {
            return nil, err
        }
        verse.Commentaries = append(verse.Commentaries, comm)
    }

    return verse, nil
}

func getEnv(v string) string {
    if os.Getenv("RENDER_SERVICE_ID") == "" { // (Render sets RENDER_SERVICE_ID in production)
		err := godotenv.Load()
		if err != nil {
			log.Println("env not found in RENDER development")
		}
	}

	envVar := os.Getenv(v)
	if envVar == "" {
		log.Fatalf("%s not found in environment variables", v)
	}

	return envVar
}

func initDB() {
    // Connection string for CockroachDB
    connStr := getEnv("CONNECTION_STRING") 
    // Open database connection
    var err error
    db, err = sql.Open("postgres", connStr)
    if err != nil {
        log.Fatal(err)
    }

    // Test the connection
    err = db.Ping()
    if err != nil {
        log.Fatal(err)
    }
}

func respondWithJSON(w http.ResponseWriter, code int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(payload)
}

func handleVerse(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    chapter := vars["chapterID"]
    verseNumber := vars["verseID"]

    verse_id := fmt.Sprintf("BG%s.%s", chapter, verseNumber)
    // Example usage
    verse, err := GetVerseWithComments(db, verse_id)
    if err != nil {
        log.Fatal(err)
    }
    respondWithJSON(w, 200, verse)
}

func enableCors(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "https://open-the.vercel.app")
}

func main() {
    initDB()
    defer db.Close()

    r := mux.NewRouter()

    r.HandleFunc("/", func (w http.ResponseWriter, r *http.Request) {
    	enableCors(&w)
	respondWithJSON(w, 200, map[string]string{"message": "Ready"})
    })
    r.HandleFunc("/chapter/{chapterID}/verse/{verseID}", handleVerse)

    http.ListenAndServe(":8080", r)
}
