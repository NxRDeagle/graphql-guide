import * as React from "react";
import Modal from "../../components/modal";
import Backdrop from "../../components/backdrop";
import EventList from "../../components/event-list";
import Spinner from "../../components/spinner";
import authContext from "../../context/auth-context";
import { MAIN_URL } from "../../constants";
import "./events.css";

const Events = () => {
  const context = React.useContext(authContext);

  const [isCreating, setIsCreating] = React.useState(false);
  const [events, setEvents] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState([]);
  const [selectedEvent, setSelectedEvent] = React.useState(null);
  const [isActive, setIsActive] = React.useState([]);

  const titleRef = React.useRef();
  const priceRef = React.useRef();
  const dateRef = React.useRef();
  const descriptionRef = React.useRef();

  const startCreateEventHandler = React.useCallback(() => {
    setIsCreating(true);
  }, [setIsCreating]);

  const modalConfirmHandler = React.useCallback(() => {
    setIsCreating(false);
    const title = titleRef.current.value;
    const price = +priceRef.current.value;
    const date = dateRef.current.value;
    const description = descriptionRef.current.value;

    if (
      title.trim().length === 0 ||
      price <= 0 ||
      date.trim().length === 0 ||
      description.trim().length === 0
    ) {
      return;
    }

    const event = { title, price, date, description };
    console.log(event);

    const requestBody = {
      query: `
          mutation CreateEvent($title: String!, $desc: String!, $price: Float!, $date: String!) {
            createEvent(eventInput: {title: $title, description: $desc, price: $price, date: $date}) {
              _id
              title
              description
              date
              price
            }
          }
        `,
      variables: {
        title: title,
        desc: description,
        price: price,
        date: date,
      },
    };

    const token = context.token;

    fetch(MAIN_URL, {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    })
      .then((result) => {
        if (result.status !== 200 && result.status !== 201) {
          throw new Error("Failed!");
        }
        return result.json();
      })
      .then((json) => {
        const { data } = json;
        const updatedEvents = [...events];
        updatedEvents.push({
          _id: data.createEvent._id,
          title: data.createEvent.title,
          description: data.createEvent.description,
          date: data.createEvent.date,
          price: data.createEvent.price,
          creator: {
            _id: context.userId,
          },
        });
        setEvents(updatedEvents);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [
    setIsCreating,
    setEvents,
    context,
    events,
    titleRef,
    priceRef,
    dateRef,
    descriptionRef,
  ]);

  const modalCancelHandler = React.useCallback(() => {
    setIsCreating(false);
    setSelectedEvent(null);
  }, [setIsCreating, setSelectedEvent]);

  const fetchEvents = React.useCallback(() => {
    setIsLoading(true);
    const requestBody = {
      query: `
          query {
            events {
              _id
              title
              description
              date
              price
              creator {
                _id
                email
              }
            }
          }
        `,
    };

    fetch(MAIN_URL, {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((result) => {
        if (result.status !== 200 && result.status !== 201) {
          throw new Error("Failed!");
        }
        return result.json();
      })
      .then((json) => {
        const fetchedEvents = json.data.events;
        if (isActive) {
          setEvents(fetchedEvents);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.log(err);
        if (isActive) {
          setIsLoading(false);
        }
      });
  }, [setIsLoading, setEvents, isActive]);

  const showDetailHandler = React.useCallback(
    (eventId) => {
      const newSelectedEvent = events.find((event) => event._id === eventId);
      setSelectedEvent(newSelectedEvent);
    },
    [events]
  );

  const bookEventHandler = React.useCallback(() => {
    if (!context.token) {
      setSelectedEvent(null);
      return;
    }
    console.log(selectedEvent);
    const requestBody = {
      query: `
          mutation BookEvent($id: ID!) {
            bookEvent(eventId: $id) {
              _id
             createdAt
             updatedAt
            }
          }
        `,
      variables: {
        id: selectedEvent._id,
      },
    };

    fetch(MAIN_URL, {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + context.token,
      },
    })
      .then((result) => {
        if (result.status !== 200 && result.status !== 201) {
          throw new Error("Failed!");
        }
        return result.json();
      })
      .then((json) => {
        console.log(json);
        setSelectedEvent(null);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [context, setSelectedEvent, selectedEvent]);

  React.useEffect(() => {
    fetchEvents();
    return () => setIsActive(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {(isCreating || selectedEvent) && <Backdrop />}
      {isCreating && (
        <Modal
          title="Add Event"
          onCancel={modalCancelHandler}
          onConfirm={modalConfirmHandler}
          confirmText="Confirm"
        >
          <form>
            <div className="form-control">
              <label htmlFor="title">Title</label>
              <input type="text" id="title" ref={titleRef} />
            </div>
            <div className="form-control">
              <label htmlFor="price">Price</label>
              <input type="number" id="price" ref={priceRef} />
            </div>
            <div className="form-control">
              <label htmlFor="date">Date</label>
              <input type="datetime-local" id="date" ref={dateRef} />
            </div>
            <div className="form-control">
              <label htmlFor="description">Description</label>
              <textarea id="description" rows="4" ref={descriptionRef} />
            </div>
          </form>
        </Modal>
      )}
      {selectedEvent && (
        <Modal
          title={selectedEvent.title}
          onCancel={modalCancelHandler}
          onConfirm={bookEventHandler}
          confirmText={context.token ? "Book" : "Confirm"}
        >
          <h1>{selectedEvent.title}</h1>
          <h2>
            ${selectedEvent.price} -{" "}
            {new Date(selectedEvent.date).toLocaleDateString()}
          </h2>
          <p>{selectedEvent.description}</p>
        </Modal>
      )}
      {context.token && (
        <div className="events-control">
          <p>Share your own Events!</p>
          <button className="btn" onClick={startCreateEventHandler}>
            Create Event
          </button>
        </div>
      )}
      {isLoading ? (
        <Spinner />
      ) : (
        <EventList
          events={events}
          authUserId={context.userId}
          onViewDetail={showDetailHandler}
        />
      )}
    </>
  );
};

export default Events;
