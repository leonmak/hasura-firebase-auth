import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import React, { useState, useEffect } from "react";
import App from "./app";
import firebaseConfig from "./config";

const provider = new firebase.auth.GoogleAuthProvider();

firebase.initializeApp(firebaseConfig);

export default function Auth() {
  const [authState, setAuthState] = useState({ status: "loading" });

  useEffect(() => {
    return firebase.auth().onAuthStateChanged(async user => {
      if (user) {
        // check for users hasura claim, setAuthState to "in" with token
        const token = await user.getIdToken(); // jwt
        const idTokenResult = await user.getIdTokenResult();  //
        const hasuraClaim = idTokenResult.claims["https://hasura.io/jwt/claims"];

        if (hasuraClaim) {
          setAuthState({ status: "in", user, token });
        } else {
          // If no claim, get firebase token again
          // Check if refresh is required.
          const metadataRef = firebase
            .database()
            .ref("metadata/" + user.uid + "/refreshTime");

          metadataRef.on("value", async () => {
            // Force refresh to pick up the latest custom claims changes.
            const token = await user.getIdToken(true);
            setAuthState({ status: "in", user, token });
          });
        }
        // if user clicked logged out, setAuthState to "out"
      } else {
        setAuthState({ status: "out" });
      }
    });
  }, []);

  const signInWithGoogle = async () => {
    try {
      await firebase.auth().signInWithPopup(provider);
    } catch (error) {
      console.log(error);
    }
  };

  const signOut = async () => {
    try {
      setAuthState({ status: "loading" });
      await firebase.auth().signOut();
      setAuthState({ status: "out" });
    } catch (error) {
      console.log(error);
    }
  };

  let content;
  if (authState.status === "loading") {
    content = null;
  } else {
    content = (
      <>
        <div>
          {authState.status === "in" ? (
            <div>
              <h2>Welcome, {authState.user.displayName}</h2>
              <button onClick={signOut}>Sign out</button>
            </div>
          ) : (
            <button onClick={signInWithGoogle}>Sign in with Google</button>
          )}
        </div>

        <App authState={authState} />
      </>
    );
  }

  return <div className="auth">{content}</div>;
}
