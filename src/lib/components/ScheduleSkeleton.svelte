<div class="space-y-3" aria-label="Memuat jadwal" role="status">
	<div class="neo-border neo-shadow rounded-xl bg-white p-3">
		<div class="h-3.5 w-32 animate-pulse rounded bg-slate-200"></div>
		<div class="mt-2 h-2.5 w-full animate-pulse rounded-full bg-slate-200"></div>
	</div>

	{#each [1, 2, 3] as idx (idx)}
		<div class="flex items-stretch gap-2.5 sm:gap-3.5">
			<div class="flex w-9 shrink-0 flex-col items-center sm:w-11">
				<div class="neo-border h-9 w-9 animate-pulse rounded-xl bg-slate-200 sm:h-11 sm:w-11"></div>
				<div class="mt-1 w-[3px] flex-1 rounded-full bg-slate-200"></div>
			</div>
			<div class="neo-border neo-shadow flex-1 rounded-xl bg-white p-3">
				<div class="h-5 w-14 animate-pulse rounded-lg bg-slate-200"></div>
				<div class="mt-2 h-4 w-3/4 animate-pulse rounded bg-slate-200"></div>
				<div class="mt-1.5 h-3.5 w-1/2 animate-pulse rounded bg-slate-100"></div>
			</div>
		</div>
	{/each}
</div>
