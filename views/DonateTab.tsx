import React from "react";

import firebaseApp from "./firebaseApp";

export const DonateTab = () => {
  const venmoUsername = "zack-do";
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const link = isMobile ? `venmo://users/${venmoUsername}` : `https://account.venmo.com/pay?recipients=${venmoUsername}`

  const [isLoading, setIsLoading] = React.useState(true);
  const [totalCost, setTotalCost] = React.useState(0);
  const [totalDonations, setTotalDonations] = React.useState(0);

  React.useEffect(() => {
    const db = firebaseApp.firestore();
    const transactionsRef = db.collection("transactions");
    const donationsRef = db.collection("donations");

    Promise.all([
      transactionsRef.get(),
      donationsRef.get(),
    ]).then((results) => {
      let totalCost = 0;
      let totalDonations = 0;
      const donations = [];

      results[0].forEach((doc) => {
        Object.values(doc.data()).forEach((doc) => {
          totalCost += doc.totalCost;
        })
      });

      results[1].forEach((doc) => {
        const donation = doc.data();
        totalDonations += donation.amount;
        donations.push(donation);
      });

      setIsLoading(false);
      setTotalCost(totalCost);
      setTotalDonations(totalDonations);
    });
  }, []);

  return (
    <>
      <h2 className="ui header">
        <i className="money bill alternate icon"></i>
        <div className="content">
          Donations
          <div className="sub header">
            Your donations help us continue reserving courts for open play.
          </div>
        </div>
      </h2>
      <div className="ui center aligned basic segment">
        <div className="ui small statistic">
          <div className="value">
            {isLoading ? <div className="ui active inline loader"></div> : <>${totalCost.toFixed(0)}</>}
          </div>
          <div className="label">
            total court reservation costs
          </div>
        </div><br />
        <div className={classnames([{ red: totalDonations < totalCost, green: totalDonations > totalCost }, "ui small statistic"])}>
          <div className="value">
            {isLoading ? <div className="ui active inline loader"></div> : <>${totalDonations.toFixed(0)}</>}
          </div>
          <div className="label">
            total donations
          </div>
        </div>

        <img className="ui segment large centered image" src={`./public/${venmoUsername}-venmo.png`} />
        <a href={link} className="ui primary button">Venmo</a><br /><br />
      </div>
    </>
  );
}
