export type LaunchMode = {
	RESUME:   'resume',
	RESTART:  'restart',
}

export type LaunchModeValues = LaunchMode[keyof LaunchMode];
