import React, { useState } from "react";
import "./App.css"; // For enhanced styling
import {
   FaCloudUploadAlt,
   FaMicrophone,
   FaBookOpen,
   FaSpinner,
   FaExclamationCircle,
   FaCheckCircle,
   FaMicrophoneAlt,
   FaDownload,
   FaTimesCircle,
} from "react-icons/fa";
import FullAnalyticsData from "./FullAnalyticsData";

function App() {
   const [audioFile, setAudioFile] = useState(null);
   const [transcribedText, setTranscribedText] = useState("");
   const [fullAnalysisData, setFullAnalysisData] = useState(null);
   const [summary, setSummary] = useState("");
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState("");
   const [transcriptionDone, setTranscriptionDone] = useState(false);
   const [summaryDone, setSummaryDone] = useState(false);
   const [isDragOver, setIsDragOver] = useState(false);

   const MAX_DURATION_SEC = 30;

   // Helper: fetch a demo file URL and send it to your existing /transcribe endpoint
   async function sendDemoToTranscribe(
      demoUrl,
      setLoading,
      setError,
      setTranscribedText,
      setTranscriptionDone
   ) {
      try {
         setLoading(true);
         setError("");
         setTranscriptionDone(false);
         setTranscribedText("");

         const res = await fetch(demoUrl, { cache: "no-store" });
         if (!res.ok) throw new Error("Failed to fetch demo audio");
         const blob = await res.blob();
         const filename = demoUrl.split("/").pop() || "demo.wav";
         const file = new File([blob], filename, {
            type: blob.type || "audio/wav",
         });

         const form = new FormData();
         form.append("audio", file);

         const resp = await fetch(
            "https://api.soundscript.me/transcribe",
            {
               method: "POST",
               body: form,
            }
         );
         const data = await resp.json();
         if (resp.ok) {
            setTranscribedText(data.transcribedText || "");
            setTranscriptionDone(true);
         } else {
            setError(data.error || "Failed to transcribe demo audio.");
         }
      } catch (e) {
         setError(e.message || "Network error while sending demo audio.");
      } finally {
         setLoading(false);
      }
   }

   // Optional: direct download via JS (if you prefer a button download as well)
   function downloadFile(url, name) {
      const a = document.createElement("a");
      a.href = url;
      a.download = name || "";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
   }

   const validateAudioDuration = (file) =>
      new Promise((resolve, reject) => {
         const audio = document.createElement("audio");
         audio.preload = "metadata";
         audio.src = URL.createObjectURL(file);
         audio.onloadedmetadata = () => {
            URL.revokeObjectURL(audio.src);
            if (isNaN(audio.duration)) {
               reject("Could not read audio duration.");
            } else if (audio.duration > MAX_DURATION_SEC) {
               reject(
                  `Audio is too long. Maximum allowed is ${MAX_DURATION_SEC} seconds.`
               );
            } else {
               resolve(true);
            }
         };
         audio.onerror = () => reject("Invalid or unreadable audio file.");
      });

   const handleFileChange = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      if (!file.type.startsWith("audio/")) {
         setError("Only audio files are accepted.");
         return;
      }

      try {
         await validateAudioDuration(file);
         // proceed with your existing logic:
         setAudioFile(file);
         setTranscribedText("");
         setSummary("");
         setError("");
         setTranscriptionDone(false);
         setSummaryDone(false);
      } catch (err) {
         setError(err);
      }
   };

   const handleClearFile = () => {
      setAudioFile(null);
      setTranscribedText("");
      setSummary("");
      setError("");
      setTranscriptionDone(false);
      setSummaryDone(false);
      const fileInput = document.getElementById("audio-upload");
      if (fileInput) fileInput.value = "";
   };

   const handleDragOver = (event) => {
      event.preventDefault();
      setIsDragOver(true);
   };

   const handleDragLeave = (event) => {
      event.preventDefault();
      setIsDragOver(false);
   };

   const handleDrop = async (event) => {
      event.preventDefault();
      setIsDragOver(false);
      const file = event.dataTransfer.files[0];
      if (!file) return;

      if (!file.type.startsWith("audio/")) {
         setError("Only audio files are accepted.");
         return;
      }

      try {
         await validateAudioDuration(file);
         // proceed with your existing logic:
         setAudioFile(file);
         setTranscribedText("");
         setSummary("");
         setError("");
         setTranscriptionDone(false);
         setSummaryDone(false);
      } catch (err) {
         setError(err);
      }
   };

   const transcribeAudio = async () => {
      if (!audioFile) {
         setError("Please select an audio file first.");
         return;
      }

      setLoading(true);
      setError("");
      setTranscriptionDone(false);
      setTranscribedText("");
      const formData = new FormData();
      formData.append("audio", audioFile);

      try {
         const response = await fetch(
            "https://api.soundscript.me/transcribe",
            {
               method: "POST",
               body: formData,
            }
         );
         const data = await response.json();
         console.log("Full data received from /summarize:", data);
         console.log("Value of data.general_summary:", data.general_summary);
         if (response.ok) {
            setTranscribedText(data.transcribedText);
            setTranscriptionDone(true);
         } else {
            setError(data.error || "Failed to transcribe audio.");
         }
      } catch (err) {
         setError("Network error or server unavailable during transcription.");
         console.error("Transcription error:", err);
      } finally {
         setLoading(false);
      }
   };

   const generateSummary = async () => {
      if (!transcribedText) {
         setError("Please transcribe the audio first to generate a summary.");
         return;
      }

      setLoading(true);
      setError("");
      setSummaryDone(false); // Reset summaryDone at the start of the process
      setSummary(""); // Clear summary when starting new process
      try {
         const response = await fetch(
            "https://api.soundscript.me/summarize",
            {
               method: "POST",
               headers: {
                  "Content-Type": "application/json",
               },
               body: JSON.stringify({ text: transcribedText }),
            }
         );
         const data = await response.json();
         if (response.ok) {
            setSummary(data.general_summary);
            setFullAnalysisData(data);
            setSummaryDone(true);
         } else {
            setError(data.error || "Failed to generate summary.");
         }
      } catch (err) {
         setError("Network error or server unavailable during summarization.");
         console.error("Summarization error:", err);
      } finally {
         setLoading(false);
      }
   };

   const handleDownload = (content, filename) => {
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
   };

   return (
      <div className="App">
         <header className="App-header">
            <h1>
               <span className="logo-icon">
                  <FaMicrophoneAlt />
               </span>
               SoundScript
            </h1>
         </header>
         <div className="container">
            <div className="input-section card">
               <label
                  htmlFor="audio-upload"
                  className={`upload-box ${isDragOver ? "drag-over" : ""}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
               >
                  <input
                     id="audio-upload"
                     type="file"
                     accept="audio/*"
                     onChange={handleFileChange}
                  />
                  <FaCloudUploadAlt className="upload-icon" />
                  <p>Drag & drop your audio file here or</p>
                  <span className="browse-text">Browse Files</span>
                  {audioFile && (
                     <p className="selected-file">
                        Selected: {audioFile.name}
                        <FaTimesCircle
                           className="clear-file-icon"
                           onClick={(e) => {
                              e.stopPropagation();
                              handleClearFile();
                           }}
                        />
                     </p>
                  )}
               </label>
               {/* Demo Audios Section (added) */}
               <div className="demo-section card" style={{ marginTop: 16 }}>
                  <h2 className="box-title" style={{ marginBottom: 12 }}>
                     Try Demo Audios
                  </h2>
                  <div className="demo-grid">
                     {/* Demo 1 */}
                     <div className="demo-card">
                        <p className="demo-title">
                           Demo 1: English, clean speech (≈8s)
                        </p>
                        <audio
                           className="demo-audio"
                           controls
                           src="/demo1.wav"
                        />
                        <div className="demo-actions">
                           <button
                              className="demo-btn primary"
                              disabled={loading}
                              onClick={() =>
                                 sendDemoToTranscribe(
                                    "/demo1.wav",
                                    setLoading,
                                    setError,
                                    setTranscribedText,
                                    setTranscriptionDone
                                 )
                              }
                           >
                              Use this audio
                           </button>
                           <a
                              className="demo-btn"
                              href="/demo1.wav"
                              download="demo1.wav"
                           >
                              Download
                           </a>
                        </div>
                     </div>

                     {/* Demo 2 */}
                     <div className="demo-card">
                        <p className="demo-title">
                           Demo 2: Noisy background (≈10s)
                        </p>
                        <audio
                           className="demo-audio"
                           controls
                           src="/demo2.wav"
                        />
                        <div className="demo-actions">
                           <button
                              className="demo-btn primary"
                              disabled={loading}
                              onClick={() =>
                                 sendDemoToTranscribe(
                                    "/demo2.wav",
                                    setLoading,
                                    setError,
                                    setTranscribedText,
                                    setTranscriptionDone
                                 )
                              }
                           >
                              Use this audio
                           </button>
                           <a
                              className="demo-btn"
                              href="/demo2.wav"
                              download="demo2.wav"
                           >
                              Download
                           </a>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="buttons">
                  <button
                     onClick={transcribeAudio}
                     disabled={loading || !audioFile}
                     className={`button ${
                        transcriptionDone ? "success-button" : ""
                     } ${
                        loading && !transcriptionDone ? "loading-button" : ""
                     }`}
                  >
                     {loading && !transcriptionDone ? (
                        <>
                           <FaSpinner className="spinner" /> Transcribing...
                        </>
                     ) : transcriptionDone ? (
                        <>
                           <FaCheckCircle /> Transcribed!
                        </>
                     ) : (
                        <>
                           <FaMicrophone /> Transcribe
                        </>
                     )}
                  </button>
                  <button
                     onClick={generateSummary}
                     disabled={loading || !transcribedText}
                     className={`button ${
                        !transcribedText ? "disabled-button" : ""
                     } ${summaryDone ? "success-button" : ""} ${
                        loading && !summaryDone && transcribedText
                           ? "loading-button"
                           : ""
                     }`}
                  >
                     {loading && !summaryDone && transcribedText ? (
                        <>
                           <FaSpinner className="spinner" /> Summarizing...
                        </>
                     ) : summaryDone ? (
                        <>
                           <FaCheckCircle /> Summarized!
                        </>
                     ) : (
                        <>
                           <FaBookOpen /> Summary
                        </>
                     )}
                  </button>
               </div>
               {error && (
                  <p className="error-message">
                     <FaExclamationCircle /> {error}
                  </p>
               )}
            </div>

            <div className="output-container">
               <h2 className="output-section-title">Output Results</h2>
               <div className="output-boxes">
                  <div className="transcription">
                     <h2 className="box-title">
                        Transcription
                        <span className="download-icons">
                           {transcribedText && (
                              <FaDownload
                                 onClick={() =>
                                    handleDownload(
                                       transcribedText,
                                       "transcription.txt"
                                    )
                                 }
                                 title="Download Transcription"
                              />
                           )}
                        </span>
                     </h2>
                     {loading && !transcriptionDone && audioFile ? (
                        <pre className="output-text loading-placeholder">
                           <FaSpinner className="spinner" /> Waiting for
                           transcription...
                        </pre>
                     ) : (
                        <pre className="output-text">
                           {transcribedText ||
                              "Transcription will appear here after processing your audio file."}
                        </pre>
                     )}
                  </div>

                  <div className="inner-div card">
                     <div className="summary">
                        <div className="box-title">
                           Summary
                           <span className="download-icons">
                              {summary && (
                                 <FaDownload
                                    onClick={() =>
                                       handleDownload(summary, "summary.txt")
                                    }
                                    title="Download Summary"
                                 />
                              )}
                           </span>
                        </div>
                        {loading && transcribedText && !summaryDone ? (
                           <pre className="output-text loading-placeholder">
                              <FaSpinner className="spinner" /> Generating
                              summary...
                           </pre>
                        ) : (
                           <pre className="output-text">
                              {summary ||
                                 (transcribedText
                                    ? "Summary will be generated from the transcribed text."
                                    : "Transcribe audio first to generate a summary.")}
                           </pre>
                        )}
                     </div>

                     <div className="contextual-analysis">
                        <h2 className="box-title">
                           Contextual Analysis
                           <span className="download-icons">
                              {fullAnalysisData && (
                                 <FaDownload
                                    onClick={() =>
                                       handleDownload(
                                          JSON.stringify(
                                             fullAnalysisData,
                                             null,
                                             2
                                          ),
                                          "full_analysis.json"
                                       )
                                    }
                                    title="Download Full Analysis"
                                 />
                              )}
                           </span>
                        </h2>
                        {loading && transcribedText && !summaryDone ? (
                           <pre className="output-text loading-placeholder">
                              <FaSpinner className="spinner" /> Generating
                              detailed analysis...
                           </pre>
                        ) : (
                           <pre className="output-text code-block">
                              {/* This line converts the JSON object to a pretty-printed string */}
                              {fullAnalysisData ? (
                                 <FullAnalyticsData data={fullAnalysisData} />
                              ) : (
                                 "Detailed analysis will appear here after summarization."
                              )}
                           </pre>
                        )}
                     </div>
                  </div>

                  {/* --- THIS IS THE NEW SECTION FOR FULL JSON ANALYSIS --- */}

                  {/* --- END NEW SECTION --- */}
               </div>
            </div>
         </div>
      </div>
   );
}

export default App;
