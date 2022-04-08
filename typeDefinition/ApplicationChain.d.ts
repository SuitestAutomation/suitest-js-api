import {
	AbstractChain,
	HasExitedModifiers,
	BaseChain,
	SendTextModifier,
	UntilModifier,
	Repeatable,
	Intervalable,
} from './modifiers';

interface ApplicationBaseQueryChain<T> extends
	BaseChain<T, ApplicationQueryResult, ApplicationAbandonedChain>
{}

interface ApplicationBaseEvalChain<T> extends
	BaseChain<T, ApplicationEvalResult, ApplicationAbandonedChain>
{}

interface ApplicationEmptyChain extends
	BaseChain<ApplicationEmptyChain, ApplicationEvalResult, ApplicationAbandonedChain>
{}

export interface ApplicationChain extends
	SendTextModifier<ApplicationRepeatIntervalUntilChain>,
	ApplicationBaseQueryChain<ApplicationChain>,
	HasExitedModifiers<ApplicationEmptyChain>
{}

interface ApplicationRepeatIntervalUntilChain extends
	ApplicationBaseEvalChain<ApplicationRepeatIntervalUntilChain>,
	UntilModifier<ApplicationRepeatIntervalChain>,
	Repeatable<ApplicationIntervalChain>,
	Intervalable<ApplicationRepeatChain>
{}

interface ApplicationRepeatIntervalChain extends
	ApplicationBaseEvalChain<ApplicationRepeatIntervalChain>,
	Repeatable<ApplicationRepeatIntervalChain>,
	Intervalable<ApplicationRepeatIntervalChain>
{}

// -repeat +interval
interface ApplicationIntervalChain extends
	ApplicationBaseEvalChain<ApplicationIntervalChain>,
	Intervalable<ApplicationEmptyChain>
{}

// +repeat -interval
interface ApplicationRepeatChain extends
	ApplicationBaseEvalChain<ApplicationRepeatChain>,
	Repeatable<ApplicationEmptyChain>
{}

interface ApplicationAbandonedChain extends
	AbstractChain
{}

type ApplicationQueryResult = string;
type ApplicationEvalResult = boolean | undefined;
