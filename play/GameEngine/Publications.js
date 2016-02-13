const Publications = (publisher) => {
  const subs = {};

  const pubs = {
    publish(action, data) {
      if (!subs.hasOwnProperty(action)) {
        return;
      }
      subs[action].forEach(({callback, subscriber}) => {
        callback(data, subscriber, publisher);
      });
    },

    subscribe(action, callback, subscriber) {
      if (!subs.hasOwnProperty(action)) {
        subs[action] = [];
      }
      const sub = {
        callback: callback,
        subscriber: subscriber
      };
      subs[action].push(sub);
    },

    unsubscribe(action, subscriber) {
      if (!subs.hasOwnProperty(action)) {
        return;
      }
      subs[action] = subs[action].filter((sub) => {
        return sub.subscriber !== subscriber;
      });
    },

  };

  return pubs;

}

export default Publications;
