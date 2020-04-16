import Head from "next/head";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Select from "react-select";
import { CustomOption, CustomSingleValue, Input } from "../components/Select";
import Fishes from "../data/fish";
import classnames from "classnames";
import "../styles/main.css";

const Index = () => {
  const { register, handleSubmit, setValue, reset } = useForm();
  const [items, setItems] = useState([]);
  const [strats, setStrats] = useState({});
  const [isLoading, setLoading] = useState(false);

  const options = Fishes.map((f) => ({
    label: `T${f.Tier} - ${f.Name}`,
    value: f.ID,
    data: f,
  }));

  const [values, setReactSelect] = useState({
    selectedOption: [],
  });

  const onSubmit = (data) => {
    const item = {
      ...data,
    };

    setItems([...items, item]);
  };

  const handleMultiChange = (selectedOption) => {
    setValue("fish", selectedOption);
    setReactSelect({ selectedOption });
  };

  useEffect(() => {
    register({ name: "fish", required: true });
  }, []);

  const calculate = async () => {
    setLoading(true);
    const ids = items.map((i) => i.fish.value);
    ids.push(["T1_FISHCHOPS", "T1_FISHSAUCE_LEVEL1", "T1_FISHSAUCE_LEVEL3"]);

    const url = `https://www.albion-online-data.com/api/v2/stats/prices/${ids.join()}?locations=Lymhurst&qualities=0`;
    console.log(url);
    const response = await fetch(url);
    const prices = await response.json();

    // Raw Strat
    const rawStrat = items.reduce((acc, cur) => {
      const price =
        prices.find((p) => p.item_id === cur.fish.value).sell_price_min *
        parseInt(cur.amount) *
        0.94;
      return acc + price;
    }, 0);

    // Chopped Fish Strat
    const seaweedAmount = parseInt(
      items.find((i) => i.fish.value === "T1_SEAWEED")?.amount ?? 0
    );

    const seaweedPrice = prices.find((p) => p.item_id === "T1_SEAWEED")
      .sell_price_min;

    const choppedFishPrice = prices.find((p) => p.item_id === "T1_FISHCHOPS")
      .sell_price_min;

    const totalChoppedFish = items.reduce((acc, cur) => {
      const inChoppedFish =
        parseInt(cur.fish.data["Chopped Fish"]) * parseInt(cur.amount);

      return acc + inChoppedFish;
    }, 0);

    console.log(totalChoppedFish);

    const choppedStrat =
      totalChoppedFish * choppedFishPrice * 0.94 +
      seaweedAmount * seaweedPrice * 0.94;

    // Basic Fish Sauce Strat
    const basicSaucePrice = prices.find(
      (p) => p.item_id === "T1_FISHSAUCE_LEVEL1"
    ).sell_price_min;

    const basicSauceAmount = Math.min(
      Math.floor(totalChoppedFish / 15),
      Math.floor(seaweedAmount / 1)
    );

    console.log("Sauce", basicSauceAmount);

    const choppedFishRemainder = totalChoppedFish - 15 * basicSauceAmount;
    const seaweedRemainder = seaweedAmount - 1 * basicSauceAmount;

    console.log(choppedFishRemainder, seaweedRemainder);

    const basicSauceStrat =
      basicSauceAmount * basicSaucePrice * 0.94 +
      choppedFishRemainder * choppedFishPrice * 0.94 +
      seaweedRemainder * seaweedPrice * 0.94;

    // Special Fish Sauce Strat
    const specialSaucePrice = prices.find(
      (p) => p.item_id === "T1_FISHSAUCE_LEVEL3"
    ).sell_price_min;

    const specialSauceAmount = Math.min(
      Math.floor(totalChoppedFish / 125),
      Math.floor(seaweedAmount / 9)
    );

    console.log("Sauce", specialSauceAmount);

    const choppedFishRemainderS = totalChoppedFish - 125 * specialSauceAmount;
    const seaweedRemainderS = seaweedAmount - 9 * specialSauceAmount;

    console.log(choppedFishRemainder, seaweedRemainder);

    const specialSauceStrat =
      specialSauceAmount * specialSaucePrice * 0.94 +
      choppedFishRemainderS * choppedFishPrice * 0.94 +
      seaweedRemainderS * seaweedPrice * 0.94;

    setStrats({
      "Raw Sell": {
        profit: rawStrat.toFixed(),
        details: {},
      },
      "Chopped Fish Sell": {
        profit: choppedStrat.toFixed(),
        details: {
          T1_FISHCHOPS: totalChoppedFish,
        },
      },
      "Basic Fish Sauce + Remainder Sell": {
        profit: basicSauceStrat.toFixed(),
        details: {
          T1_FISHSAUCE_LEVEL1: basicSauceAmount,
          T1_FISHCHOPS: choppedFishRemainder,
          T1_SEAWEED: seaweedRemainder,
        },
      },
      "Special Fish Sauce + Remainder Sell": {
        profit: specialSauceStrat.toFixed(),
        details: {
          T1_FISHSAUCE_LEVEL1: specialSauceAmount,
          T1_FISHCHOPS: choppedFishRemainderS,
          T1_SEAWEED: seaweedRemainderS,
        },
      },
    });
    console.log(rawStrat, choppedStrat, basicSauceStrat, specialSauceStrat);
    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>Foo</title>
        <link href="https://rsms.me/inter/inter.css" rel="stylesheet" />
      </Head>

      <div className="max-w-2xl mx-auto">
        <div className="px-8 py-12">
          <h1 className="pb-8 text-2xl font-semibold text-center">
            Fisherman's Calculator
          </h1>
          <div className="grid grid-cols-1 gap-8">
            <div className="col-span-1">
              <div className="px-4 py-3 bg-white rounded shadow">
                <span className="text-xs font-semibold leading-3 tracking-wider text-gray-800 uppercase">
                  Add Fish Item
                </span>
                <form
                  className="grid grid-cols-4 gap-4 mt-3"
                  onSubmit={handleSubmit(onSubmit)}
                >
                  <label className="col-span-3">
                    <span className="text-gray-700">Fish</span>
                    <Select
                      className="z-50 border-gray-400"
                      instanceId={1}
                      options={options}
                      isMulti={false}
                      isClearable={true}
                      components={{
                        Option: CustomOption,
                        SingleValue: CustomSingleValue,
                        Input: Input,
                      }}
                      value={values.selectedOption}
                      onChange={handleMultiChange}
                    />
                  </label>
                  <label className="col-span-1">
                    <span className="text-gray-700">Amount</span>
                    <input
                      type="number"
                      name="amount"
                      ref={register({ required: true })}
                      className="block w-full leading-3 border-gray-400 form-input"
                    />
                  </label>
                  <button className="flex items-center justify-center w-full col-span-4 px-4 py-3 font-medium leading-4 tracking-wider text-white bg-blue-600 rounded">
                    ADD
                  </button>
                </form>
              </div>
              <div className="mb-4"></div>
              <div className="flex items-center px-4 py-3 bg-white rounded shadow">
                {items.length === 0 && (
                  <div className="w-full py-6 text-center text-gray-600">
                    Fish Inventory
                  </div>
                )}
                <div className="flex flex-wrap text-gray-600">
                  {items.map((i, ind) => (
                    <div
                      className="relative flex items-center justify-center w-20 h-20 m-2 border border-gray-400 rounded group"
                      key={ind}
                    >
                      <img
                        className="transition-opacity duration-200 ease-in-out group-hover:opacity-0"
                        src={`https://gameinfo.albiononline.com/api/gameinfo/items/${i.fish.value}`}
                        alt={i.fish.label}
                      />
                      <div className="absolute bottom-0 right-0 z-30 flex items-center justify-center w-6 h-6 -mb-2 -mr-2 text-xs font-medium text-white bg-blue-600 rounded-full">
                        {i.amount}
                      </div>
                      <button
                        type="button"
                        className="absolute inset-0 z-20 flex items-center justify-center w-full transition-opacity duration-200 ease-in-out bg-gray-900 rounded opacity-0 group-hover:opacity-100"
                        onClick={() => {
                          setItems((it) =>
                            it.filter((item) => {
                              return item.fish.value !== i.fish.value;
                            })
                          );
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          className="w-8 h-8 text-white fill-current"
                        >
                          <path d="M14.59 8L12 10.59 9.41 8 8 9.41 10.59 12 8 14.59 9.41 16 12 13.41 14.59 16 16 14.59 13.41 12 16 9.41 14.59 8zM12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {items.length > 0 && (
              <div className="px-4 py-3 bg-white rounded shadow">
                <button
                  className={classnames(
                    "flex items-center justify-center w-full col-span-4 px-4 py-3 font-medium leading-4 tracking-wider text-white rounded",
                    {
                      "bg-gray-600 cursor-not-allowed": isLoading,
                      "bg-blue-600": !isLoading,
                    }
                  )}
                  disabled={isLoading}
                  onClick={() => calculate()}
                >
                  {isLoading ? "LOADING..." : "CALCULATE"}
                </button>

                {Object.entries(strats).map(([key, value]: [any, any]) => (
                  <div className="pt-3" key={key}>
                    <div className="flex items-start justify-between">
                      <div className="flex flex-col text-sm font-medium tracking-wide uppercase">
                        <span>{key}</span>
                        <ul className="text-xs normal-case list-disc list-inside">
                          {Object.entries((value as any).details).map(
                            ([k, v]) => {
                              console.log(k, v);
                              return (
                                <li key={k}>
                                  {Fishes.find((f) => f.ID === k).Name} x {v}
                                </li>
                              );
                            }
                          )}
                        </ul>
                      </div>
                      <span
                        className={classnames("text-sm font-semibold tracking-widest", {
                          "text-green-600": value.profit > -1,
                          "text-red-600": value.profit < 0,
                        })}
                      >
                        {value.profit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Index;
