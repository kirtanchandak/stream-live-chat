import { useState, useRef, useEffect } from "react";
import Head from "next/head";
import YouTube from "react-youtube";
import { StreamChat } from "stream-chat";
import {
  Chat,
  Channel,
  ChannelHeader,
  MessageInput,
  VirtualizedMessageList,
  Window,
} from "stream-chat-react";
import styles from "../styles/Home.module.css";
import "stream-chat-react/dist/css/v2/index.css";

export default function Home() {
  const [user, setUser] = useState({});
  const [client, setClient] = useState();
  const [channel, setChannel] = useState();

  console.log("client", client);
  console.log("channel", channel);
  const videoRef = useRef();

  useEffect(() => {
    if (!user?.id) return;
    (async function run() {
      const client = StreamChat.getInstance(
        process.env.NEXT_PUBLIC_STREAM_API_KEY
      );
      setClient(client);

      const { token } = await fetch("/api/token", {
        method: "POST",
        body: JSON.stringify({
          id: user.id,
        }),
      }).then((r) => r.json());

      await client.connectUser(
        {
          id: user.id,
          name: user.id,
          // image: "https://i.imgur.com/fR9Jz14.png",
          image: "/favicon.ico",
        },
        token
      );
      const channel = client.channel("livestream", "KirtanSpace", {
        name: "This a discusion channel",
      });
      setChannel(channel);
    })();

    return () => {
      client.disconnectUser();
      setChannel(undefined);
    };
  }, [user.id]);

  /**
   * onStartVideo
   */

  function onStartVideo() {
    const player = videoRef.current.getInternalPlayer();
    player.playVideo();
  }

  /**
   * onStopVideo
   */

  function onStopVideo() {
    const player = videoRef.current.getInternalPlayer();
    player.pauseVideo();
  }

  /**
   * onReplayVideo
   */

  function onReplayVideo() {
    const player = videoRef.current.getInternalPlayer();

    player.pauseVideo();
    player.seekTo(0);
    player.playVideo();
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Stream &amp; Chat!</title>
        <meta
          name="description"
          content="Watch some youtube and chat with your friends!"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {!user?.id && (
          <>
            <h1>Stream</h1>

            <p>To get started, enter your username or alias:</p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const id = Array.from(e.currentTarget.elements).find(
                  ({ name }) => name === "userId"
                ).value;
                setUser({ id });
              }}
            >
              <input type="text" name="userId" />
              <button>Join</button>
            </form>
          </>
        )}

        {user?.id && (
          <>
            <div className={styles.stream}>
              <div className={styles.streamVideo}>
                <YouTube
                  ref={videoRef}
                  videoId="uD5LESdaAd8"
                  opts={{
                    playerVars: {
                      controls: 0,
                    },
                  }}
                />
                <p>
                  <button onClick={onStartVideo}>Start</button>
                  <button onClick={onStopVideo}>Stop</button>
                  <button onClick={onReplayVideo}>Replay</button>
                </p>
              </div>

              <div>
                {client && channel && (
                  <Chat client={client} theme="str-chat__theme-dark">
                    <Channel channel={channel}>
                      <Window>
                        <ChannelHeader live />
                        <VirtualizedMessageList />
                        <MessageInput focus />
                      </Window>
                    </Channel>
                  </Chat>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
