import { a as createLucideIcon, r as reactExports, u as useControllableState, j as jsxRuntimeExports, b as createContextScope, d as composeEventHandlers, P as Primitive, e as useComposedRefs, c as cn, T as TrendingUp } from "./index-BMAOQGGr.js";
import { A as Alert, a as AlertDescription, b as AlertTitle } from "./alert-DeTqM6RN.js";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent, B as Badge } from "./card-BIDaU0aL.js";
import { u as useDirection, c as clamp, S as ScrollArea } from "./scroll-area-B_MRFC6R.js";
import { S as Skeleton } from "./skeleton-CXQ8sRzl.js";
import { c as createCollection, T as Tabs, a as TabsList, b as TabsTrigger, d as TabsContent } from "./tabs-Pv2bUYL2.js";
import { u as useBinanceMarketData, a as useRecommendations } from "./useQueries-BgEhU_Jm.js";
import { T as TabFetchErrorState, A as AIPerformancePanel } from "./TabFetchErrorState-CoG9vYZ2.js";
import { u as usePrevious, S as Star } from "./index-CtwOr3H1.js";
import { u as useSize } from "./index-b69PIPWt.js";
import { C as CircleAlert } from "./binanceFetch-CHtJR5Bx.js";
import { T as Target } from "./target-BXpRbyGY.js";
import { Z as Zap } from "./zap-1L4H6ib-.js";
import { P as PredictiveConfidencePanel } from "./PredictiveConfidencePanel-Crq30m3P.js";
import { B as Brain } from "./brain-DTHLmVRD.js";
import "./learningEngine-DnDrJIqT.js";
import "./refresh-cw-CqqcaVpj.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["path", { d: "M3 3v16a2 2 0 0 0 2 2h16", key: "c24i48" }],
  ["path", { d: "M18 17V9", key: "2bz60n" }],
  ["path", { d: "M13 17V5", key: "1frdt8" }],
  ["path", { d: "M8 17v-3", key: "17ska0" }]
];
const ChartColumn = createLucideIcon("chart-column", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  [
    "path",
    {
      d: "M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z",
      key: "96xj49"
    }
  ]
];
const Flame = createLucideIcon("flame", __iconNode);
var PAGE_KEYS = ["PageUp", "PageDown"];
var ARROW_KEYS = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
var BACK_KEYS = {
  "from-left": ["Home", "PageDown", "ArrowDown", "ArrowLeft"],
  "from-right": ["Home", "PageDown", "ArrowDown", "ArrowRight"],
  "from-bottom": ["Home", "PageDown", "ArrowDown", "ArrowLeft"],
  "from-top": ["Home", "PageDown", "ArrowUp", "ArrowLeft"]
};
var SLIDER_NAME = "Slider";
var [Collection, useCollection, createCollectionScope] = createCollection(SLIDER_NAME);
var [createSliderContext] = createContextScope(SLIDER_NAME, [
  createCollectionScope
]);
var [SliderProvider, useSliderContext] = createSliderContext(SLIDER_NAME);
var Slider$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const {
      name,
      min = 0,
      max = 100,
      step = 1,
      orientation = "horizontal",
      disabled = false,
      minStepsBetweenThumbs = 0,
      defaultValue = [min],
      value,
      onValueChange = () => {
      },
      onValueCommit = () => {
      },
      inverted = false,
      form,
      ...sliderProps
    } = props;
    const thumbRefs = reactExports.useRef(/* @__PURE__ */ new Set());
    const valueIndexToChangeRef = reactExports.useRef(0);
    const isHorizontal = orientation === "horizontal";
    const SliderOrientation = isHorizontal ? SliderHorizontal : SliderVertical;
    const [values = [], setValues] = useControllableState({
      prop: value,
      defaultProp: defaultValue,
      onChange: (value2) => {
        var _a;
        const thumbs = [...thumbRefs.current];
        (_a = thumbs[valueIndexToChangeRef.current]) == null ? void 0 : _a.focus();
        onValueChange(value2);
      }
    });
    const valuesBeforeSlideStartRef = reactExports.useRef(values);
    function handleSlideStart(value2) {
      const closestIndex = getClosestValueIndex(values, value2);
      updateValues(value2, closestIndex);
    }
    function handleSlideMove(value2) {
      updateValues(value2, valueIndexToChangeRef.current);
    }
    function handleSlideEnd() {
      const prevValue = valuesBeforeSlideStartRef.current[valueIndexToChangeRef.current];
      const nextValue = values[valueIndexToChangeRef.current];
      const hasChanged = nextValue !== prevValue;
      if (hasChanged) onValueCommit(values);
    }
    function updateValues(value2, atIndex, { commit } = { commit: false }) {
      const decimalCount = getDecimalCount(step);
      const snapToStep = roundValue(Math.round((value2 - min) / step) * step + min, decimalCount);
      const nextValue = clamp(snapToStep, [min, max]);
      setValues((prevValues = []) => {
        const nextValues = getNextSortedValues(prevValues, nextValue, atIndex);
        if (hasMinStepsBetweenValues(nextValues, minStepsBetweenThumbs * step)) {
          valueIndexToChangeRef.current = nextValues.indexOf(nextValue);
          const hasChanged = String(nextValues) !== String(prevValues);
          if (hasChanged && commit) onValueCommit(nextValues);
          return hasChanged ? nextValues : prevValues;
        } else {
          return prevValues;
        }
      });
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      SliderProvider,
      {
        scope: props.__scopeSlider,
        name,
        disabled,
        min,
        max,
        valueIndexToChangeRef,
        thumbs: thumbRefs.current,
        values,
        orientation,
        form,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Collection.Provider, { scope: props.__scopeSlider, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Collection.Slot, { scope: props.__scopeSlider, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          SliderOrientation,
          {
            "aria-disabled": disabled,
            "data-disabled": disabled ? "" : void 0,
            ...sliderProps,
            ref: forwardedRef,
            onPointerDown: composeEventHandlers(sliderProps.onPointerDown, () => {
              if (!disabled) valuesBeforeSlideStartRef.current = values;
            }),
            min,
            max,
            inverted,
            onSlideStart: disabled ? void 0 : handleSlideStart,
            onSlideMove: disabled ? void 0 : handleSlideMove,
            onSlideEnd: disabled ? void 0 : handleSlideEnd,
            onHomeKeyDown: () => !disabled && updateValues(min, 0, { commit: true }),
            onEndKeyDown: () => !disabled && updateValues(max, values.length - 1, { commit: true }),
            onStepKeyDown: ({ event, direction: stepDirection }) => {
              if (!disabled) {
                const isPageKey = PAGE_KEYS.includes(event.key);
                const isSkipKey = isPageKey || event.shiftKey && ARROW_KEYS.includes(event.key);
                const multiplier = isSkipKey ? 10 : 1;
                const atIndex = valueIndexToChangeRef.current;
                const value2 = values[atIndex];
                const stepInDirection = step * multiplier * stepDirection;
                updateValues(value2 + stepInDirection, atIndex, { commit: true });
              }
            }
          }
        ) }) })
      }
    );
  }
);
Slider$1.displayName = SLIDER_NAME;
var [SliderOrientationProvider, useSliderOrientationContext] = createSliderContext(SLIDER_NAME, {
  startEdge: "left",
  endEdge: "right",
  size: "width",
  direction: 1
});
var SliderHorizontal = reactExports.forwardRef(
  (props, forwardedRef) => {
    const {
      min,
      max,
      dir,
      inverted,
      onSlideStart,
      onSlideMove,
      onSlideEnd,
      onStepKeyDown,
      ...sliderProps
    } = props;
    const [slider, setSlider] = reactExports.useState(null);
    const composedRefs = useComposedRefs(forwardedRef, (node) => setSlider(node));
    const rectRef = reactExports.useRef(void 0);
    const direction = useDirection(dir);
    const isDirectionLTR = direction === "ltr";
    const isSlidingFromLeft = isDirectionLTR && !inverted || !isDirectionLTR && inverted;
    function getValueFromPointer(pointerPosition) {
      const rect = rectRef.current || slider.getBoundingClientRect();
      const input = [0, rect.width];
      const output = isSlidingFromLeft ? [min, max] : [max, min];
      const value = linearScale(input, output);
      rectRef.current = rect;
      return value(pointerPosition - rect.left);
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      SliderOrientationProvider,
      {
        scope: props.__scopeSlider,
        startEdge: isSlidingFromLeft ? "left" : "right",
        endEdge: isSlidingFromLeft ? "right" : "left",
        direction: isSlidingFromLeft ? 1 : -1,
        size: "width",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          SliderImpl,
          {
            dir: direction,
            "data-orientation": "horizontal",
            ...sliderProps,
            ref: composedRefs,
            style: {
              ...sliderProps.style,
              ["--radix-slider-thumb-transform"]: "translateX(-50%)"
            },
            onSlideStart: (event) => {
              const value = getValueFromPointer(event.clientX);
              onSlideStart == null ? void 0 : onSlideStart(value);
            },
            onSlideMove: (event) => {
              const value = getValueFromPointer(event.clientX);
              onSlideMove == null ? void 0 : onSlideMove(value);
            },
            onSlideEnd: () => {
              rectRef.current = void 0;
              onSlideEnd == null ? void 0 : onSlideEnd();
            },
            onStepKeyDown: (event) => {
              const slideDirection = isSlidingFromLeft ? "from-left" : "from-right";
              const isBackKey = BACK_KEYS[slideDirection].includes(event.key);
              onStepKeyDown == null ? void 0 : onStepKeyDown({ event, direction: isBackKey ? -1 : 1 });
            }
          }
        )
      }
    );
  }
);
var SliderVertical = reactExports.forwardRef(
  (props, forwardedRef) => {
    const {
      min,
      max,
      inverted,
      onSlideStart,
      onSlideMove,
      onSlideEnd,
      onStepKeyDown,
      ...sliderProps
    } = props;
    const sliderRef = reactExports.useRef(null);
    const ref = useComposedRefs(forwardedRef, sliderRef);
    const rectRef = reactExports.useRef(void 0);
    const isSlidingFromBottom = !inverted;
    function getValueFromPointer(pointerPosition) {
      const rect = rectRef.current || sliderRef.current.getBoundingClientRect();
      const input = [0, rect.height];
      const output = isSlidingFromBottom ? [max, min] : [min, max];
      const value = linearScale(input, output);
      rectRef.current = rect;
      return value(pointerPosition - rect.top);
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      SliderOrientationProvider,
      {
        scope: props.__scopeSlider,
        startEdge: isSlidingFromBottom ? "bottom" : "top",
        endEdge: isSlidingFromBottom ? "top" : "bottom",
        size: "height",
        direction: isSlidingFromBottom ? 1 : -1,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          SliderImpl,
          {
            "data-orientation": "vertical",
            ...sliderProps,
            ref,
            style: {
              ...sliderProps.style,
              ["--radix-slider-thumb-transform"]: "translateY(50%)"
            },
            onSlideStart: (event) => {
              const value = getValueFromPointer(event.clientY);
              onSlideStart == null ? void 0 : onSlideStart(value);
            },
            onSlideMove: (event) => {
              const value = getValueFromPointer(event.clientY);
              onSlideMove == null ? void 0 : onSlideMove(value);
            },
            onSlideEnd: () => {
              rectRef.current = void 0;
              onSlideEnd == null ? void 0 : onSlideEnd();
            },
            onStepKeyDown: (event) => {
              const slideDirection = isSlidingFromBottom ? "from-bottom" : "from-top";
              const isBackKey = BACK_KEYS[slideDirection].includes(event.key);
              onStepKeyDown == null ? void 0 : onStepKeyDown({ event, direction: isBackKey ? -1 : 1 });
            }
          }
        )
      }
    );
  }
);
var SliderImpl = reactExports.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeSlider,
      onSlideStart,
      onSlideMove,
      onSlideEnd,
      onHomeKeyDown,
      onEndKeyDown,
      onStepKeyDown,
      ...sliderProps
    } = props;
    const context = useSliderContext(SLIDER_NAME, __scopeSlider);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.span,
      {
        ...sliderProps,
        ref: forwardedRef,
        onKeyDown: composeEventHandlers(props.onKeyDown, (event) => {
          if (event.key === "Home") {
            onHomeKeyDown(event);
            event.preventDefault();
          } else if (event.key === "End") {
            onEndKeyDown(event);
            event.preventDefault();
          } else if (PAGE_KEYS.concat(ARROW_KEYS).includes(event.key)) {
            onStepKeyDown(event);
            event.preventDefault();
          }
        }),
        onPointerDown: composeEventHandlers(props.onPointerDown, (event) => {
          const target = event.target;
          target.setPointerCapture(event.pointerId);
          event.preventDefault();
          if (context.thumbs.has(target)) {
            target.focus();
          } else {
            onSlideStart(event);
          }
        }),
        onPointerMove: composeEventHandlers(props.onPointerMove, (event) => {
          const target = event.target;
          if (target.hasPointerCapture(event.pointerId)) onSlideMove(event);
        }),
        onPointerUp: composeEventHandlers(props.onPointerUp, (event) => {
          const target = event.target;
          if (target.hasPointerCapture(event.pointerId)) {
            target.releasePointerCapture(event.pointerId);
            onSlideEnd(event);
          }
        })
      }
    );
  }
);
var TRACK_NAME = "SliderTrack";
var SliderTrack = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeSlider, ...trackProps } = props;
    const context = useSliderContext(TRACK_NAME, __scopeSlider);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.span,
      {
        "data-disabled": context.disabled ? "" : void 0,
        "data-orientation": context.orientation,
        ...trackProps,
        ref: forwardedRef
      }
    );
  }
);
SliderTrack.displayName = TRACK_NAME;
var RANGE_NAME = "SliderRange";
var SliderRange = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeSlider, ...rangeProps } = props;
    const context = useSliderContext(RANGE_NAME, __scopeSlider);
    const orientation = useSliderOrientationContext(RANGE_NAME, __scopeSlider);
    const ref = reactExports.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, ref);
    const valuesCount = context.values.length;
    const percentages = context.values.map(
      (value) => convertValueToPercentage(value, context.min, context.max)
    );
    const offsetStart = valuesCount > 1 ? Math.min(...percentages) : 0;
    const offsetEnd = 100 - Math.max(...percentages);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.span,
      {
        "data-orientation": context.orientation,
        "data-disabled": context.disabled ? "" : void 0,
        ...rangeProps,
        ref: composedRefs,
        style: {
          ...props.style,
          [orientation.startEdge]: offsetStart + "%",
          [orientation.endEdge]: offsetEnd + "%"
        }
      }
    );
  }
);
SliderRange.displayName = RANGE_NAME;
var THUMB_NAME = "SliderThumb";
var SliderThumb = reactExports.forwardRef(
  (props, forwardedRef) => {
    const getItems = useCollection(props.__scopeSlider);
    const [thumb, setThumb] = reactExports.useState(null);
    const composedRefs = useComposedRefs(forwardedRef, (node) => setThumb(node));
    const index = reactExports.useMemo(
      () => thumb ? getItems().findIndex((item) => item.ref.current === thumb) : -1,
      [getItems, thumb]
    );
    return /* @__PURE__ */ jsxRuntimeExports.jsx(SliderThumbImpl, { ...props, ref: composedRefs, index });
  }
);
var SliderThumbImpl = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeSlider, index, name, ...thumbProps } = props;
    const context = useSliderContext(THUMB_NAME, __scopeSlider);
    const orientation = useSliderOrientationContext(THUMB_NAME, __scopeSlider);
    const [thumb, setThumb] = reactExports.useState(null);
    const composedRefs = useComposedRefs(forwardedRef, (node) => setThumb(node));
    const isFormControl = thumb ? context.form || !!thumb.closest("form") : true;
    const size = useSize(thumb);
    const value = context.values[index];
    const percent = value === void 0 ? 0 : convertValueToPercentage(value, context.min, context.max);
    const label = getLabel(index, context.values.length);
    const orientationSize = size == null ? void 0 : size[orientation.size];
    const thumbInBoundsOffset = orientationSize ? getThumbInBoundsOffset(orientationSize, percent, orientation.direction) : 0;
    reactExports.useEffect(() => {
      if (thumb) {
        context.thumbs.add(thumb);
        return () => {
          context.thumbs.delete(thumb);
        };
      }
    }, [thumb, context.thumbs]);
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "span",
      {
        style: {
          transform: "var(--radix-slider-thumb-transform)",
          position: "absolute",
          [orientation.startEdge]: `calc(${percent}% + ${thumbInBoundsOffset}px)`
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Collection.ItemSlot, { scope: props.__scopeSlider, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Primitive.span,
            {
              role: "slider",
              "aria-label": props["aria-label"] || label,
              "aria-valuemin": context.min,
              "aria-valuenow": value,
              "aria-valuemax": context.max,
              "aria-orientation": context.orientation,
              "data-orientation": context.orientation,
              "data-disabled": context.disabled ? "" : void 0,
              tabIndex: context.disabled ? void 0 : 0,
              ...thumbProps,
              ref: composedRefs,
              style: value === void 0 ? { display: "none" } : props.style,
              onFocus: composeEventHandlers(props.onFocus, () => {
                context.valueIndexToChangeRef.current = index;
              })
            }
          ) }),
          isFormControl && /* @__PURE__ */ jsxRuntimeExports.jsx(
            SliderBubbleInput,
            {
              name: name ?? (context.name ? context.name + (context.values.length > 1 ? "[]" : "") : void 0),
              form: context.form,
              value
            },
            index
          )
        ]
      }
    );
  }
);
SliderThumb.displayName = THUMB_NAME;
var BUBBLE_INPUT_NAME = "RadioBubbleInput";
var SliderBubbleInput = reactExports.forwardRef(
  ({ __scopeSlider, value, ...props }, forwardedRef) => {
    const ref = reactExports.useRef(null);
    const composedRefs = useComposedRefs(ref, forwardedRef);
    const prevValue = usePrevious(value);
    reactExports.useEffect(() => {
      const input = ref.current;
      if (!input) return;
      const inputProto = window.HTMLInputElement.prototype;
      const descriptor = Object.getOwnPropertyDescriptor(inputProto, "value");
      const setValue = descriptor.set;
      if (prevValue !== value && setValue) {
        const event = new Event("input", { bubbles: true });
        setValue.call(input, value);
        input.dispatchEvent(event);
      }
    }, [prevValue, value]);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.input,
      {
        style: { display: "none" },
        ...props,
        ref: composedRefs,
        defaultValue: value
      }
    );
  }
);
SliderBubbleInput.displayName = BUBBLE_INPUT_NAME;
function getNextSortedValues(prevValues = [], nextValue, atIndex) {
  const nextValues = [...prevValues];
  nextValues[atIndex] = nextValue;
  return nextValues.sort((a, b) => a - b);
}
function convertValueToPercentage(value, min, max) {
  const maxSteps = max - min;
  const percentPerStep = 100 / maxSteps;
  const percentage = percentPerStep * (value - min);
  return clamp(percentage, [0, 100]);
}
function getLabel(index, totalValues) {
  if (totalValues > 2) {
    return `Value ${index + 1} of ${totalValues}`;
  } else if (totalValues === 2) {
    return ["Minimum", "Maximum"][index];
  } else {
    return void 0;
  }
}
function getClosestValueIndex(values, nextValue) {
  if (values.length === 1) return 0;
  const distances = values.map((value) => Math.abs(value - nextValue));
  const closestDistance = Math.min(...distances);
  return distances.indexOf(closestDistance);
}
function getThumbInBoundsOffset(width, left, direction) {
  const halfWidth = width / 2;
  const halfPercent = 50;
  const offset = linearScale([0, halfPercent], [0, halfWidth]);
  return (halfWidth - offset(left) * direction) * direction;
}
function getStepsBetweenValues(values) {
  return values.slice(0, -1).map((value, index) => values[index + 1] - value);
}
function hasMinStepsBetweenValues(values, minStepsBetweenValues) {
  if (minStepsBetweenValues > 0) {
    const stepsBetweenValues = getStepsBetweenValues(values);
    const actualMinStepsBetweenValues = Math.min(...stepsBetweenValues);
    return actualMinStepsBetweenValues >= minStepsBetweenValues;
  }
  return true;
}
function linearScale(input, output) {
  return (value) => {
    if (input[0] === input[1] || output[0] === output[1]) return output[0];
    const ratio = (output[1] - output[0]) / (input[1] - input[0]);
    return output[0] + ratio * (value - input[0]);
  };
}
function getDecimalCount(value) {
  return (String(value).split(".")[1] || "").length;
}
function roundValue(value, decimalCount) {
  const rounder = Math.pow(10, decimalCount);
  return Math.round(value * rounder) / rounder;
}
var Root = Slider$1;
var Track = SliderTrack;
var Range = SliderRange;
var Thumb = SliderThumb;
function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}) {
  const _values = reactExports.useMemo(
    () => Array.isArray(value) ? value : Array.isArray(defaultValue) ? defaultValue : [min, max],
    [value, defaultValue, min, max]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Root,
    {
      "data-slot": "slider",
      defaultValue,
      value,
      min,
      max,
      className: cn(
        "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        className
      ),
      ...props,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Track,
          {
            "data-slot": "slider-track",
            className: cn(
              "bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"
            ),
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Range,
              {
                "data-slot": "slider-range",
                className: cn(
                  "bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
                )
              }
            )
          }
        ),
        Array.from({ length: _values.length }, (value2, _) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          Thumb,
          {
            "data-slot": "slider-thumb",
            className: "border-primary bg-background ring-ring/50 block size-4 shrink-0 rounded-full border shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
          },
          `${value2}`
        ))
      ]
    }
  );
}
function median(values) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}
function stdDev(values, mean) {
  if (values.length < 2) return 0;
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}
function average(values) {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}
function extractMetrics(asset, medianVolume) {
  const price = Number.parseFloat(asset.lastPrice);
  const high = Number.parseFloat(asset.highPrice);
  const low = Number.parseFloat(asset.lowPrice);
  const open = Number.parseFloat(asset.openPrice);
  const volume = Number.parseFloat(asset.quoteVolume);
  const range = high - low;
  const volatility = price > 0 ? range / price : 0;
  const distFromOpen = open > 0 ? (price - open) / open : 0;
  const volumeRatio = medianVolume > 0 ? volume / medianVolume : 1;
  const priceNearHigh = range > 0 ? (high - price) / range : 0.5;
  const greenCandle = price > open;
  const compression = volatility < 0.02 && greenCandle;
  const nearResistance = priceNearHigh < 0.1;
  return {
    volumeRatio,
    distFromOpen,
    volatility,
    priceNearHigh,
    greenCandle,
    compression,
    nearResistance,
    volume
  };
}
function buildAltaProfile(marketData, threshold = 8) {
  const medianVol = median(
    marketData.map((a) => Number.parseFloat(a.quoteVolume))
  );
  const spiked = marketData.filter((a) => a.priceChangePercent >= threshold);
  if (spiked.length < 3) {
    const sorted = [...marketData].sort(
      (a, b) => b.priceChangePercent - a.priceChangePercent
    );
    spiked.push(
      ...sorted.slice(0, Math.max(5, Math.floor(sorted.length * 0.05)))
    );
  }
  const metrics = spiked.map((a) => extractMetrics(a, medianVol));
  const volRatios = metrics.map((m) => m.volumeRatio);
  const distValues = metrics.map((m) => Math.abs(m.distFromOpen));
  const volatValues = metrics.map((m) => m.volatility);
  const avgVolRatio = average(volRatios);
  const avgDist = average(distValues);
  const avgVolat = average(volatValues);
  return {
    avgVolumeRatio: avgVolRatio,
    avgDistFromOpen: avgDist,
    avgVolatility: avgVolat,
    avgPriceNearHigh: average(metrics.map((m) => m.priceNearHigh)),
    stdVolume: stdDev(volRatios, avgVolRatio),
    stdDistFromOpen: stdDev(distValues, avgDist),
    stdVolatility: stdDev(volatValues, avgVolat),
    sampleSize: spiked.length
  };
}
function computeScore(metrics, profile) {
  const safeDiv = (a, b) => b > 0 ? Math.min(a / b, 2) : 0;
  const volScore = safeDiv(metrics.volumeRatio, profile.avgVolumeRatio) * 0.4;
  const distScore = safeDiv(Math.abs(metrics.distFromOpen), profile.avgDistFromOpen) * 0.3;
  const volatScore = safeDiv(metrics.volatility, profile.avgVolatility) * 0.3;
  const rawScore = Math.min(volScore, 0.4) + Math.min(distScore, 0.3) + Math.min(volatScore, 0.3);
  return Math.round(rawScore * 100) / 100;
}
function detectAltaCandidates(marketData, profile, threshold = 8, minScore = 0.55) {
  const medianVol = median(
    marketData.map((a) => Number.parseFloat(a.quoteVolume))
  );
  const candidates = marketData.filter(
    (a) => a.priceChangePercent < threshold && a.priceChangePercent > -5
  );
  const results = [];
  for (const asset of candidates) {
    const m = extractMetrics(asset, medianVol);
    const score = computeScore(m, profile);
    if (score < minScore) continue;
    const reasons = [];
    if (m.volumeRatio > profile.avgVolumeRatio * 0.8) {
      reasons.push(`Volume ${m.volumeRatio.toFixed(1)}x acima da média`);
    }
    if (m.distFromOpen > 0 && m.distFromOpen > profile.avgDistFromOpen * 0.7) {
      reasons.push(`+${(m.distFromOpen * 100).toFixed(1)}% vs abertura`);
    }
    if (m.greenCandle) {
      reasons.push("Candle de alta");
    }
    if (m.nearResistance) {
      reasons.push("Próximo da resistência 24h");
    }
    if (m.compression) {
      reasons.push("Compressão de preço detectada");
    }
    if (m.volatility > profile.avgVolatility * 0.8) {
      reasons.push(
        `Volatilidade elevada (${(m.volatility * 100).toFixed(1)}%)`
      );
    }
    if (m.volumeRatio > profile.avgVolumeRatio * 1.5) {
      reasons.push("Aceleração de volume");
    }
    if (reasons.length === 0) reasons.push("Perfil estatístico similar");
    results.push({
      symbol: asset.symbol,
      lastPrice: asset.lastPrice,
      priceChangePercent: asset.priceChangePercent,
      score,
      reasons,
      metrics: {
        volumeRatio: m.volumeRatio,
        distFromOpen: m.distFromOpen,
        volatility: m.volatility,
        priceNearHigh: m.priceNearHigh,
        greenCandle: m.greenCandle,
        compression: m.compression,
        nearResistance: m.nearResistance
      }
    });
  }
  return results.sort(
    (a, b) => b.score !== a.score ? b.score - a.score : a.symbol.localeCompare(b.symbol)
  ).slice(0, 20);
}
function AltaPatternPanel() {
  const { data: marketData, isLoading } = useBinanceMarketData();
  const [threshold, setThreshold] = reactExports.useState(8);
  const { profile, candidates, spikesFound } = reactExports.useMemo(() => {
    if (!marketData || marketData.length === 0) {
      return { profile: null, candidates: [], spikesFound: 0 };
    }
    const p = buildAltaProfile(marketData, threshold);
    const c = detectAltaCandidates(marketData, p, threshold);
    const spikesFound2 = marketData.filter(
      (a) => a.priceChangePercent >= threshold
    ).length;
    return { profile: p, candidates: c, spikesFound: spikesFound2 };
  }, [marketData, threshold]);
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: [1, 2, 3].map((_i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-28" }, _i)) });
  }
  const topCandidates = candidates.slice(0, 15);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-2 border-neon-orange/40 bg-card/60 backdrop-blur-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "w-5 h-5 text-neon-orange animate-pulse" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-neon-orange", children: "Detector de Potencial de Alta" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Identifica ativos com padrão similar aos que explodiram recentemente. Score > 0.7 = alto potencial." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Limiar de alta significativa:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "bg-neon-orange/20 text-neon-orange border-neon-orange/60", children: [
              "+",
              threshold,
              "% em 24h"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Slider,
            {
              "data-ocid": "alta.threshold.input",
              min: 3,
              max: 20,
              step: 1,
              value: [threshold],
              onValueChange: ([v]) => setThreshold(v),
              className: "w-full"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "3%" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "20%" })
          ] })
        ] }),
        profile && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2 rounded bg-accent/30 border border-neon-orange/20 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-neon-orange font-bold", children: spikesFound }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: "Explosões detectadas" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2 rounded bg-accent/30 border border-neon-cyan/20 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-neon-cyan font-bold", children: [
              profile.avgVolumeRatio.toFixed(1),
              "x"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: "Vol. médio das altas" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2 rounded bg-accent/30 border border-neon-green/20 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-neon-green font-bold", children: topCandidates.length }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: "Candidatos" })
          ] })
        ] })
      ] })
    ] }),
    topCandidates.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { className: "border-neon-orange/30 bg-neon-orange/5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4 text-neon-orange" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDescription, { className: "text-muted-foreground", children: "Nenhum candidato encontrado com o limiar atual. Tente reduzir o threshold." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "h-[520px] pr-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: topCandidates.map((c, idx) => {
      const scorePercent = Math.round(c.score * 100);
      const isHot = c.score >= 0.7;
      const isMedium = c.score >= 0.6 && c.score < 0.7;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        Card,
        {
          "data-ocid": `alta.candidate.card.${idx + 1}`,
          className: cn(
            "border-2 bg-gradient-to-br from-card/80 backdrop-blur-sm transition-all duration-200",
            isHot ? "border-neon-orange/60 to-neon-orange/10 shadow-[0_0_12px_rgba(255,120,0,0.2)]" : isMedium ? "border-neon-yellow/40 to-neon-yellow/5" : "border-border/40 to-transparent"
          ),
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3 mb-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                isHot && /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "w-4 h-4 text-neon-orange flex-shrink-0" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-lg text-foreground", children: c.symbol }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
                    "$",
                    Number.parseFloat(c.lastPrice).toLocaleString(
                      "en-US",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 4
                      }
                    )
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-end gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Badge,
                  {
                    className: cn(
                      "text-sm font-bold px-3 py-1 border-2",
                      isHot ? "bg-neon-orange/20 text-neon-orange border-neon-orange/60" : isMedium ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/40" : "bg-muted/20 text-muted-foreground border-muted/40"
                    ),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "w-3 h-3 mr-1" }),
                      "Score ",
                      scorePercent,
                      "%"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Badge,
                  {
                    className: cn(
                      "text-xs",
                      c.priceChangePercent >= 0 ? "bg-neon-green/10 text-neon-green border border-neon-green/30" : "bg-neon-red/10 text-neon-red border border-neon-red/30"
                    ),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-3 h-3 mr-1" }),
                      c.priceChangePercent >= 0 ? "+" : "",
                      c.priceChangePercent.toFixed(2),
                      "%"
                    ]
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs text-muted-foreground mb-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Similaridade com perfil de alta" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  scorePercent,
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 bg-muted/30 rounded-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: cn(
                    "h-full rounded-full transition-all",
                    isHot ? "bg-neon-orange" : isMedium ? "bg-yellow-400" : "bg-muted-foreground"
                  ),
                  style: { width: `${scorePercent}%` }
                }
              ) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-1.5 mb-3 text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-1.5 rounded bg-accent/20 border border-border/30 text-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "w-3 h-3 mx-auto mb-0.5 text-neon-cyan" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-neon-cyan font-medium", children: [
                  c.metrics.volumeRatio.toFixed(1),
                  "x"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: "Volume" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-1.5 rounded bg-accent/20 border border-border/30 text-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "w-3 h-3 mx-auto mb-0.5 text-neon-purple" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-neon-purple font-medium", children: [
                  (c.metrics.volatility * 100).toFixed(1),
                  "%"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: "Volatil." })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-1.5 rounded bg-accent/20 border border-border/30 text-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-3 h-3 mx-auto mb-0.5 text-neon-green" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-neon-green font-medium", children: [
                  c.metrics.distFromOpen >= 0 ? "+" : "",
                  (c.metrics.distFromOpen * 100).toFixed(1),
                  "%"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: "vs Abertura" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: c.reasons.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              Badge,
              {
                variant: "outline",
                className: "text-xs border-neon-orange/30 text-neon-orange/80",
                children: r
              },
              r
            )) })
          ] })
        },
        c.symbol
      );
    }) }) })
  ] });
}
function TopRecommendations() {
  const {
    data: marketData,
    isLoading: marketLoading,
    error: marketError
  } = useBinanceMarketData();
  const {
    data: recommendations,
    isLoading: recsLoading,
    error: recsError
  } = useRecommendations();
  const [activeView, setActiveView] = reactExports.useState(
    "recommendations"
  );
  const isLoading = marketLoading || recsLoading;
  const error = marketError || recsError;
  if (error) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      TabFetchErrorState,
      {
        error,
        title: "Recommendations Unavailable",
        description: "Unable to generate recommendations from live market data. Check your internet connection and try again."
      }
    );
  }
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-2 border-border bg-card/60 backdrop-blur-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-64" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-96 mt-2" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: [1, 2, 3, 4, 5].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-32" }, i)) }) })
    ] });
  }
  const topRecs = recommendations == null ? void 0 : recommendations.map((rec) => {
    const market = marketData == null ? void 0 : marketData.find((m) => m.symbol === rec.symbol);
    return { ...rec, market };
  }).filter((rec) => rec.market).slice(0, 10);
  const hasRecommendations = topRecs && topRecs.length > 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Tabs,
    {
      value: activeView,
      onValueChange: (v) => setActiveView(v),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "w-full grid grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            TabsTrigger,
            {
              value: "recommendations",
              "data-ocid": "ia.recommendations.tab",
              className: "gap-2",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "w-4 h-4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Recomendações IA" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "alta", "data-ocid": "ia.alta.tab", className: "gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "w-4 h-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Potencial de Alta" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "recommendations", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-2 border-neon-green/30 bg-card/60 backdrop-blur-sm shadow-neon-bullish", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "w-6 h-6 text-neon-green fill-neon-green animate-pulse-bullish" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-2xl text-neon-green neon-text-bullish", children: "Top Recommendations" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { className: "text-base", children: "Assets with highest upside potential based on advanced algorithmic analysis, predictive confidence and continuous learning" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: !hasRecommendations ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { className: "border-2 border-neon-cyan/40 bg-neon-cyan/10", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-5 w-5 text-neon-cyan" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTitle, { className: "text-neon-cyan font-bold", children: "Generating Recommendations" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDescription, { className: "text-muted-foreground", children: "The system is analyzing live market data and generating recommendations automatically. Recommendations will appear shortly based on Smart Money Concepts, Volume Delta, Liquidity analysis, institutional order detection and continuous AI learning." })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "h-[700px] pr-2 overflow-x-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4 min-w-0", children: topRecs.map((rec, index) => {
            const isHighConfidence = rec.confidence >= 0.7;
            const hasLearning = rec.market && (rec.market.analysis.learningLevel || 0) >= 0.6;
            return /* @__PURE__ */ jsxRuntimeExports.jsx(
              Card,
              {
                className: cn(
                  "border-2 bg-gradient-to-br from-card/80 backdrop-blur-sm hover:scale-[1.02] transition-all duration-300 min-w-0",
                  isHighConfidence ? "to-neon-green/10 border-neon-green/50 shadow-neon-bullish animate-pulse-bullish" : "to-neon-cyan/10 border-neon-green/40 hover:shadow-neon-bullish"
                ),
                children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 sm:p-6 min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row items-start justify-between gap-3 mb-4 min-w-0", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 min-w-0 flex-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-shrink-0", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "div",
                          {
                            className: cn(
                              "absolute inset-0 blur-lg opacity-60 rounded-full",
                              isHighConfidence ? "bg-neon-green" : "bg-neon-cyan"
                            )
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "div",
                          {
                            className: cn(
                              "relative text-primary-foreground font-bold text-xl w-12 h-12 rounded-full flex items-center justify-center border-2",
                              isHighConfidence ? "bg-gradient-to-br from-neon-green to-neon-cyan border-neon-green shadow-neon-bullish" : "bg-gradient-to-br from-neon-cyan to-neon-blue border-neon-cyan"
                            ),
                            children: index + 1
                          }
                        )
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-xl text-neon-green neon-text-bullish truncate", children: rec.symbol }),
                          hasLearning && /* @__PURE__ */ jsxRuntimeExports.jsx(Brain, { className: "w-5 h-5 text-neon-purple flex-shrink-0" })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground font-medium truncate", children: [
                          "Binance Futures USD-M",
                          hasLearning && " • AI Advanced"
                        ] })
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row sm:flex-col gap-2 items-start sm:items-end flex-shrink-0", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        Badge,
                        {
                          className: cn(
                            "text-base sm:text-lg px-3 sm:px-4 py-1.5 sm:py-2 border-2 font-bold whitespace-nowrap",
                            isHighConfidence ? "bg-neon-green/20 text-neon-green border-neon-green/60 shadow-neon-bullish" : "bg-neon-cyan/20 text-neon-cyan border-neon-cyan/60"
                          ),
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "w-4 sm:w-5 h-4 sm:h-5 mr-1 fill-current" }),
                            rec.strength.toFixed(0),
                            "%"
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        Badge,
                        {
                          className: cn(
                            "text-xs sm:text-sm px-2 sm:px-3 py-1 border-2 font-bold whitespace-nowrap",
                            isHighConfidence ? "bg-neon-green/20 text-neon-green border-neon-green/60" : "bg-neon-cyan/20 text-neon-cyan border-neon-cyan/60"
                          ),
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "w-3 sm:w-4 h-3 sm:h-4 mr-1" }),
                            Math.round(rec.confidence * 100),
                            "% confidence"
                          ]
                        }
                      )
                    ] })
                  ] }),
                  rec.market && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 sm:gap-4 mb-4 min-w-0", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 p-2 sm:p-3 rounded-lg bg-accent/30 border border-neon-cyan/30 min-w-0", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground font-medium", children: "Current Price" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-base sm:text-lg font-bold text-neon-cyan truncate", children: [
                          "$",
                          Number.parseFloat(
                            rec.market.lastPrice
                          ).toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 p-2 sm:p-3 rounded-lg bg-neon-green/10 border border-neon-green/40 min-w-0", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground font-medium", children: "24h Change" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 min-w-0", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-4 sm:w-5 h-4 sm:h-5 text-neon-green flex-shrink-0" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-base sm:text-lg font-bold text-neon-green truncate", children: [
                            rec.market.priceChangePercent.toFixed(
                              2
                            ),
                            "%"
                          ] })
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 p-2 sm:p-3 rounded-lg bg-accent/30 border border-neon-blue/30 min-w-0", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground font-medium", children: "24h Volume" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-base sm:text-lg font-bold text-neon-blue truncate", children: [
                          "$",
                          (Number.parseFloat(
                            rec.market.quoteVolume
                          ) / 1e6).toFixed(1),
                          "M"
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 p-2 sm:p-3 rounded-lg bg-accent/30 border border-neon-purple/30 min-w-0", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground font-medium", children: "Prediction" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-base sm:text-lg font-bold text-neon-purple truncate", children: [
                          "$",
                          rec.market.analysis.prediction.toLocaleString(
                            "en-US",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            }
                          )
                        ] })
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 min-w-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      PredictiveConfidencePanel,
                      {
                        analysis: rec.market.analysis,
                        symbol: rec.symbol,
                        compact: true
                      }
                    ) }),
                    hasLearning && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 min-w-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      AIPerformancePanel,
                      {
                        symbol: rec.symbol,
                        compact: true
                      }
                    ) }),
                    (rec.market.analysis.manipulationZones.length > 0 || rec.market.analysis.institutionalOrders.length > 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 mb-4 min-w-0", children: [
                      rec.market.analysis.manipulationZones.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "bg-neon-orange/20 text-neon-orange border border-neon-orange/60 text-xs", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "img",
                          {
                            src: "/assets/generated/manipulation-zone-icon-transparent.dim_48x48.png",
                            alt: "",
                            className: "w-3 h-3 mr-1"
                          }
                        ),
                        rec.market.analysis.manipulationZones.length,
                        " ",
                        "Manipulation Zone",
                        rec.market.analysis.manipulationZones.length > 1 ? "s" : ""
                      ] }),
                      rec.market.analysis.institutionalOrders.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "bg-neon-purple/20 text-neon-purple border border-neon-purple/60 text-xs", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "img",
                          {
                            src: "/assets/generated/institutional-order-icon-transparent.dim_48x48.png",
                            alt: "",
                            className: "w-3 h-3 mr-1"
                          }
                        ),
                        rec.market.analysis.institutionalOrders.length,
                        " ",
                        "Institutional Order",
                        rec.market.analysis.institutionalOrders.length > 1 ? "s" : ""
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 min-w-0", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-bold text-neon-cyan", children: "Key Indicators:" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: rec.market.analysis.tags.map((tag) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Badge,
                        {
                          variant: "outline",
                          className: "text-xs border-neon-cyan/40 text-neon-cyan",
                          children: tag
                        },
                        tag
                      )) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground leading-relaxed break-words", children: [
                        "Strong ",
                        rec.market.analysis.trend,
                        " trend detected with ",
                        rec.strength.toFixed(0),
                        "% strength. Technical analysis shows",
                        " ",
                        rec.market.analysis.confidence >= 0.7 ? "high" : "moderate",
                        " ",
                        "confidence based on price action, volume analysis, and market structure.",
                        hasLearning && " Enhanced by AI learning from historical predictions."
                      ] })
                    ] })
                  ] })
                ] })
              },
              `${rec.symbol}-${rec.timestamp}`
            );
          }) }) }) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "alta", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AltaPatternPanel, {}) })
      ]
    }
  ) });
}
export {
  TopRecommendations as default
};
