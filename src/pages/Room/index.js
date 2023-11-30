import {useParams} from 'react-router';
import useWebRTC, {LOCAL_VIDEO} from '../../hooks/useWebRTC';
import styles from './room.module.css';
import ReactPlayer from 'react-player';
import { useState, useEffect } from 'react';
import socket from '../../socket';

function layout(clientsNumber = 1) {
  const pairs = Array.from({length: clientsNumber})
    .reduce((acc, next, index, arr) => {
      if (index % 2 === 0) {
        acc.push(arr.slice(index, index + 2));
      }

      return acc;
    }, []);

  const rowsNumber = pairs.length;
  const height = `${100 / rowsNumber}%`;

  return pairs.map((row, index, arr) => {

    if (index === arr.length - 1 && row.length === 1) {
      return [{
        width: '100%',
        height,
      }];
    }

    return row.map(() => ({
      width: '50%',
      height,
    }));
  }).flat();
}

function Room() {
  const { id: roomID } = useParams();
  const { clients, provideMediaRef } = useWebRTC(roomID);
  const videoLayout = layout(clients.length);
  const [uri, setUri] = useState('');
  const [link, setLink] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    socket.on('videoChanged', newUri => {
      setUri(newUri);
    });

    return () => {
      socket.off('videoChanged');
    };
  }, []);
  
  const handlePlaying = () => {
    socket.emit('startVideo', {
      roomID: roomID,
      playing: !isPlaying
    });
    setIsPlaying(!isPlaying)
  };

  useEffect(() => {
    socket.on('VideoStart', playing => {
      setIsPlaying(playing);
    });
  
    return () => {
      socket.off('VideoStart');
    };
  }, []);

  const handleSearch = () => {
    socket.emit('changeVideo', {
      roomID: roomID,
      link: link
    });
    setUri(link);
  };

  return (
    <div>
      {uri.length > 0 ? (
        <div className={styles.player}>
          <ReactPlayer url={uri} playing={isPlaying} />
        </div>
        
      ) : (
        <div className={styles.input_container}>
          <input
            type="text"
            className={styles.custom_input}
            placeholder="Введите текст"
            value={link}
            onChange={(event) => setLink(event.target.value)}
          />
          <button
            className={styles.custom_button}
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
      )}

          <button onClick={handlePlaying}>Play/Stop</button>

      <div className={styles.videosContainer}>
        {clients.map((clientID, index) => (
          <div
            key={clientID}
            style={{ ...videoLayout[index], width: '50%', height: '50%', margin: 0 }}
            id={clientID}
            className={styles.videoContainer}
          >
            <video
              className={styles.playerVideo}
              ref={(instance) => {
                provideMediaRef(clientID, instance);
              }}
              autoPlay
              playsInline
              muted={clientID === LOCAL_VIDEO}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Room;