import Head from "next/head";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Select from "react-select";
import { CustomOption, CustomSingleValue, Input } from "../components/Select";
import Fishes from "../data/fish";
import classnames from "classnames";
import "../styles/main.css";

const Index = () => {
  const { register, handleSubmit, setValue } = useForm();
  const [items, setItems] = useState([]);
  const [strats, setStrats] = useState([]);
  const [isLoading, setLoading] = useState(false);

  const options = Fishes.filter(
    (f) => !["T1_FISHSAUCE_LEVEL1", "T1_FISHSAUCE_LEVEL3"].includes(f.ID)
  ).map((f) => ({
    label: `T${f.Tier} - ${f.Name}`,
    value: f.ID,
    data: f,
  }));

  const [values, setReactSelect] = useState({
    selectedOption: [],
  });

  const handleMultiChange = (selectedOption) => {
    setValue("fish", selectedOption);
    setReactSelect({ selectedOption });
  };

  useEffect(() => {
    register({ name: "fish", required: true });
  }, []);

  const handleAmountChange = (id, amount) => {
    setItems(
      items.map((f) => {
        if (f.fish.value !== id) return f;

        return {
          ...f,
          amount,
        };
      })
    );
  };

  const formatNumber = (number) =>
    new Intl.NumberFormat("en-ID", { minimumFractionDigits: 0 })
      .format(number.toFixed())
      .replace(/\,/, ".");

  const onSubmit = (data) => {
    const item = {
      ...data,
    };

    if (items.find((f) => f.fish.value === item.fish.value)) {
      setItems(
        items.map((f) => {
          if (f.fish.value !== item.fish.value) return f;

          return {
            ...f,
            amount: item.amount,
          };
        })
      );
    } else {
      setItems([...items, item]);
    }
  };

  const calculate = async () => {
    setLoading(true);
    const ids = items.map((i) => i.fish.value);
    ids.push(
      "T1_SEAWEED",
      "T1_FISHCHOPS",
      "T1_FISHSAUCE_LEVEL1",
      "T1_FISHSAUCE_LEVEL3"
    );

    const url = `https://www.albion-online-data.com/api/v2/stats/prices/${ids.join()}?locations=Lymhurst&qualities=0`;
    const response = await fetch(url);
    const prices = await response.json();

    const choppedFishPrice = prices.find((p) => p.item_id === "T1_FISHCHOPS")
      .buy_price_max;

    const results = items.map((item) => {
      const rawPrice =
        prices.find((p) => p.item_id === item.fish.value).buy_price_max *
        parseInt(item.amount) *
        0.94;

      let choppedPrice = 0;
      const choppedAmount = parseInt(item.fish.data["Chopped Fish"])
      if (choppedAmount > 0) {
        choppedPrice = parseInt(item.amount) * choppedAmount * choppedFishPrice * 0.94;
      }

      return {
        id: item.fish.value,
        amount: item.amount,
        raw: rawPrice,
        chopped: choppedPrice,
        best: Math.max(rawPrice, choppedPrice),
      };
    });
    console.log(results);
    setStrats(results);

    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>Albion Fisherman's Calculator</title>
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
                      className="flex flex-col items-center w-20 mx-2 space-y-2"
                      key={ind}
                    >
                      <div className="relative group">
                        <img
                          className="object-cover w-16 transition-opacity duration-200 ease-in-out group-hover:opacity-0"
                          src={`https://gameinfo.albiononline.com/api/gameinfo/items/${i.fish.value}`}
                          alt={i.fish.label}
                        />
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
                      <input
                        type="text"
                        className="w-full py-1 text-sm leading-3 text-center text-gray-900 border border-gray-400 form-input"
                        defaultValue={i.amount}
                        onChange={(e) =>
                          handleAmountChange(i.fish.value, e.target.value)
                        }
                      />
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

                {strats.length > 0 && (
                  <div className="pt-3">
                    <table className="w-full text-right table-auto">
                      <thead className="border-b">
                        <tr>
                          <th className="px-4 py-2 text-center">Item</th>
                          <th className="px-4 py-2">Raw Sell</th>
                          <th className="px-4 py-2">Chopped Sell</th>
                          <th className="px-4 py-2">Best</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm font-medium text-gray-900">
                        {strats.map((item) => (
                          <tr key={item.id}>
                            <td className="flex items-center justify-center px-4 py-2 text-center">
                              <img
                                className="object-cover w-16 transition-opacity duration-200 ease-in-out group-hover:opacity-0"
                                src={`https://gameinfo.albiononline.com/api/gameinfo/items/${item.id}`}
                                alt="test"
                              />
                              x {item.amount}
                            </td>
                            <td className="px-4 py-2">
                              {formatNumber(item.raw)}
                            </td>
                            <td className="px-4 py-2">
                              {formatNumber(item.chopped)}
                            </td>
                            <td className="px-4 py-2">
                              {formatNumber(item.best)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="text-sm font-semibold text-gray-900 border-t">
                        <tr>
                          <td className="flex items-center justify-center px-4 py-2 text-center">
                            Total
                          </td>
                          <td className="px-4 py-2">
                            {formatNumber(
                              strats.reduce((acc, item) => acc + item.raw, 0)
                            )}
                          </td>
                          <td className="px-4 py-2">
                            {formatNumber(
                              strats.reduce(
                                (acc, item) => acc + item.chopped,
                                0
                              )
                            )}
                          </td>
                          <td className="px-4 py-2">
                            {formatNumber(
                              strats.reduce((acc, item) => acc + item.best, 0)
                            )}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Index;
