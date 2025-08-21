export default function FullAnalyticsData({ data }) {
   console.log(data);
   return (
      <ul className="analysis-list">
         <li>
            <strong>Call Duration:</strong>
            {data.call_metadata.duration}
         </li>
         <li>
            <strong>Filename:</strong>
            {data.call_metadata.filename}
         </li>
         <li>
            <strong>Language:</strong>
            {data.call_metadata.language}
         </li>
         <li>
            <strong>Cultural Context:</strong>
            {data.cultural_context}
         </li>

         <li>
            <strong>Sentiment:</strong>
            <span className="analysis-sentiment">
               {data.sentiment_analysis.sentiment}
            </span>
            <br />
            <em>{data.sentiment_analysis.justification}</em>
         </li>
         <li>
            <strong>Speaker Estimation:</strong>
            {data.speaker_estimation}
         </li>
         <li>
            <strong>Speakers' Duration:</strong>
            {Object.entries(data["speakers' duration"]).map(
               ([speaker, time]) => (
                  <div key={speaker}>
                     {speaker}: {time}
                  </div>
               )
            )}
         </li>
      </ul>
   );
}
