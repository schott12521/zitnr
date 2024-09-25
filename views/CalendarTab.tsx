import React from "react";
import moment from "moment";

import firebaseApp from "./firebaseApp";

export const CalendarTab = () => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [date, setDate] = React.useState(moment().format("YYYY-MM-DD"));
  const [park, setPark] = React.useState(MILLER_PARK_ID);
  const [unreservedData, setUnreservedData] = React.useState({});
  const [securedData, setSecuredData] = React.useState({});

  React.useEffect(() => {
    const db = firebaseApp.firestore();
    const unreservedDocRef = db.collection("unreserved").doc(`${park}-${date}`);
    const securedDocRef = db.collection("secured").doc(`${park}-${date}`);

    const promise1 = unreservedDocRef.get().then((doc) => {
      if (doc.exists) {
        setUnreservedData(doc.data());
      } else {
        setUnreservedData({ times: [] })
      }
    });

    const promise2 = securedDocRef.get().then((doc) => {
      if (doc.exists) {
        setSecuredData(doc.data());
      } else {
        setSecuredData({ times: [] })
      }
    });

    Promise.all([promise1, promise2]).then(() => {
      setIsLoading(false);
    });
  }, [date, park]);


  const calendar = React.useMemo(() => {
    return computeCalendar(date, unreservedData, securedData, park);
  }, [date, unreservedData, securedData, park]);

  return (
    <>
      <h2 className="ui header">
        <i className="calendar alternate icon"></i>
        <div className="content">
          Calendar
          <div className="sub header">
            Query court's reservation schedule
          </div>
        </div>
      </h2>

      <div class="ui visible yellow message">
        <p>The last day that z.i.t.n.r. will be reserving the courts is September 30th since rainy season is coming. We will start reserving the courts again next year.</p>
      </div>


      <div className={classnames(["ui basic segment"])}>
        <form className="ui form">
          <div className="two fields">

            <div className="field">
              <label>park</label>
              <div className="ui selection dropdown" ref={(ref) => {
                $(ref).dropdown({
                  onChange: function (value) {
                    setPark(value);
                    setUnreservedData({});
                    setSecuredData({});
                    setIsLoading(true);
                  }
                });
              }}>
                <input type="hidden" name="parkId" value={park} />
                <i className="dropdown icon"></i>
                <div className="default text">park</div>
                <div className="menu">
                  {PARKS.map((park) => {
                    return <div className="item" data-value={park.id}>{park.name}</div>
                  })}
                </div>
              </div>
            </div>

            <div className="field">
              <label>date</label>
              <div className="ui input">
                <input type="date" value={date} placeholder="Search..." onChange={(e) => {
                  setDate(e.target.value);
                  setUnreservedData({});
                  setSecuredData({});
                  setIsLoading(true);
                }} />
              </div>
            </div>
          </div>
        </form>

        <div className={classnames(["ui", { loading: isLoading }, "basic segment"])}>
          {calendar.length == 0 && <div className="ui center aligned basic segment">No results found</div>}
          <div className="ui relaxed list">
            {calendar.map((entry) => {
              return (<div key={entry.startTime} className="item">
                <i className={`${entry.icon} icon`}></i>
                <div className="content">
                  <div className="header">{entry.description}</div>
                  <div className="description">{entry.startTime} - {entry.endTime}</div>
                </div>
              </div>)
            })}
          </div>
        </div>
      </div>
    </>
  )
};
