import data from "./users.json" assert { type: "json" };
// import image from "./R.png"
console.log(data);

// TO MAKE THE MAP APPEAR YOU MUST
      // ADD YOUR ACCESS TOKEN FROM
      // https://account.mapbox.com
      mapboxgl.accessToken =
        "pk.eyJ1Ijoic2F5YW50YW4wNzA1IiwiYSI6ImNsYzFuZWVtYzFybmszbm1xbmRzYXI1a2oifQ.USUdhNXUMjVFM7ywRPbrTg";
      const map = new mapboxgl.Map({
        container: "map",
        // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
        style: "mapbox://styles/mapbox/streets-v12",
        zoom: 14,
        center : [90.3673565,23.8320386]
      });

      map.on("load", async () => {
        // Get the initial location of the International Space Station (ISS).
        const geojson = await getLocation(0);
        // Add the ISS location as a source.
        map.loadImage(
            'https://docs.mapbox.com/mapbox-gl-js/assets/cat.png',
            (error, image) => {
            if (error) throw error;
             
            console.log(image)
            // Add the image to the map style.
            map.addImage('cat', image);
            });
        map.addSource("iss", {
          type: "geojson",
          data: geojson,
        });
        // Add the rocket symbol layer to the map.
        map.addLayer({
          id: "iss",
          type: "symbol",
          source: "iss",
          layout: {
            // This icon is a part of the Mapbox Streets style.
            // To view all images available in a Mapbox style, open
            // the style in Mapbox Studio and click the "Images" tab.
            // To add a new image to the style at runtime see
            // https://docs.mapbox.com/mapbox-gl-js/example/add-image/
            "icon-image": "bicycle",
            'icon-size': 2
          },
        });

        // Update the source from the API every 2 seconds.
        let counter = 0;
        const updateSource = setInterval(async () => {
          counter = counter + 1;
          console.log(data[counter]);
          const geojson = await getLocation(counter);
          map.getSource("iss").setData(geojson);
        }, 2000);

        async function getLocation(counter) {
          // Make a GET request to the API and return the location of the ISS.
          if (counter){
            map.flyTo({
                center: [data[counter].longitude, data[counter].latitude],
                speed: 0.5,
              });
            return {
                type: "FeatureCollection",
                features: [
                  {
                    type: "Feature",
                    geometry: {
                      type: "Point",
                      coordinates: [data[counter].longitude, data[counter].latitude],
                    },
                  },
                ],
              };
          }
          else{
              try {
                const response = await fetch(
                  "https://api.wheretheiss.at/v1/satellites/25544",
                  { method: "GET" }
                );
                const { latitude, longitude } = await response.json();
                // Fly the map to the location.
                // map.flyTo({
                //   center: [longitude, latitude],
                //   speed: 0.5,
                // });
                // Return the location of the ISS as GeoJSON.
                return {
                  type: "FeatureCollection",
                  features: [
                    {
                      type: "Feature",
                      geometry: {
                        type: "Point",
                        coordinates: [longitude, latitude],
                      },
                    },
                  ],
                };
              } catch (err) {
                // If the updateSource interval is defined, clear the interval to stop updating the source.
                if (updateSource) clearInterval(updateSource);
                throw new Error(err);
              }

        }
      }
      });