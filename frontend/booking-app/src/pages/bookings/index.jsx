import * as React from "react";
import Spinner from "../../components/spinner";
import BookingList from "../../components/booking-list";
import BookingsChart from "../../components/booking-chart";
import BookingsControls from "../../components/booking-controls";
import authContext from "../../context/auth-context";
import { MAIN_URL } from "../../constants";

const Bookings = () => {
  const context = React.useContext(authContext);
  const [isLoading, setIsLoading] = React.useState(false);
  const [bookings, setBookings] = React.useState([]);
  const [outputType, setOutputType] = React.useState("list");

  const fetchBookings = React.useCallback(() => {
    setIsLoading(true);
    const requestBody = {
      query: `
          query {
            bookings {
              _id
             createdAt
             event {
               _id
               title
               date
               price
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
        const fetchedBookings = json.data.bookings;
        setBookings(fetchedBookings);
        setIsLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setIsLoading(false);
      });
  }, [setIsLoading, setBookings, context]);

  const deleteBookingHandler = React.useCallback(
    (bookingId) => {
      setIsLoading(true);
      const requestBody = {
        query: `
          mutation CancelBooking($id: ID!) {
            cancelBooking(bookingId: $id) {
            _id
             title
            }
          }
        `,
        variables: {
          id: bookingId,
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
        // eslint-disable-next-line no-unused-vars
        .then((json) => {
          const updatedBookings = bookings.filter((booking) => {
            return booking._id !== bookingId;
          });
          setBookings(updatedBookings);
          setIsLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setIsLoading(false);
        });
    },
    [setIsLoading, context, setBookings, bookings]
  );

  const changeOutputTypeHandler = React.useCallback(
    (type) => {
      if (type === "list") {
        setOutputType("list");
      } else {
        setOutputType("chart");
      }
    },
    [setOutputType]
  );

  React.useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return isLoading ? (
    <Spinner />
  ) : (
    <>
      <BookingsControls
        activeOutputType={outputType}
        onChange={changeOutputTypeHandler}
      />
      <div>
        {outputType === "list" ? (
          <BookingList bookings={bookings} onDelete={deleteBookingHandler} />
        ) : (
          <BookingsChart bookings={bookings} />
        )}
      </div>
    </>
  );
};

export default Bookings;
