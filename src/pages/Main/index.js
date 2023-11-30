import { useState, useEffect, useRef } from 'react';
import socket from '../../socket';
import ACTIONS from '../../socket/actions';
import { useNavigate } from 'react-router-dom';
import styles from './main.module.css'
import { v4 } from 'uuid';

export default function Main() {
  const navigate = useNavigate();
  const [rooms, updateRooms] = useState([]);
  const rootNode = useRef();

  useEffect(() => {
    socket.on(ACTIONS.SHARE_ROOMS, ({ rooms = [] } = {}) => {
      if (rootNode.current) {
        updateRooms(rooms);
      }
    });
  }, []);

  return (
    <div ref={rootNode} className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.h1}>Available Rooms</h1>

        <button className={styles.newRoom}
          onClick={() => {
            navigate(`/room/${v4()}`);
          }}
        >
          Create New Room
        </button>
      </div>
      

      <ul className={styles.rooms}>
        {rooms.length > 0 ?
          rooms.map((roomID) => (
            <li key={roomID}>
              <span className={styles.roomID}>Room ID</span>: {roomID}
              <button
                onClick={() => {
                  navigate(`/room/${roomID}`);
                }}
              >
                <span>JOIN ROOM</span>
              </button>
            </li>
          ))
        : <span className={styles.noRooms}>No rooms available</span>}
      </ul>
      
    </div>
  );
}
