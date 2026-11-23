<script lang="ts">
	interface Props {
		variant?: 'mini' | 'full';
	}

	let { variant = 'mini' }: Props = $props();
</script>

{#if variant === 'mini'}
	<svg
		class="h-5 w-5 sm:h-6 sm:w-6"
		viewBox="0 0 40 40"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		aria-hidden="true"
	>
		<circle cx="20" cy="21" r="13" fill="#FDE047" stroke="#0F172A" stroke-width="2.5" />
		<path d="M12 8L8 12M28 8L32 12" stroke="#7DD3FC" stroke-width="3" stroke-linecap="round" />
		<circle cx="15.5" cy="19.5" r="1.8" fill="#0F172A" />
		<circle cx="24.5" cy="19.5" r="1.8" fill="#0F172A" />
		<path
			d="M16 24.5C17.2 26.2 22.8 26.2 24 24.5"
			stroke="#0F172A"
			stroke-width="2.2"
			stroke-linecap="round"
		/>
		<circle cx="12.5" cy="22.5" r="1.6" fill="#FCA5A5" />
		<circle cx="27.5" cy="22.5" r="1.6" fill="#FCA5A5" />
	</svg>
{:else}
	<div class="animate-float mx-auto flex h-28 w-32 items-center justify-center sm:h-40 sm:w-44">
		<svg
			viewBox="0 0 220 190"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			class="h-full w-full"
			role="img"
			aria-label="Ilustrasi maskot Kudil yang melambai"
		>
			<path
				d="M32 42L35 34L38 42L46 45L38 48L35 56L32 48L24 45L32 42Z"
				fill="#FDE047"
				stroke="#0F172A"
				stroke-width="2.5"
				stroke-linejoin="round"
			/>
			<path
				d="M180 30L182.5 23L185 30L192 32.5L185 35L182.5 42L180 35L173 32.5L180 30Z"
				fill="#7DD3FC"
				stroke="#0F172A"
				stroke-width="2.5"
				stroke-linejoin="round"
			/>
			<circle cx="188" cy="128" r="6" fill="#86EFAC" stroke="#0F172A" stroke-width="2.5" />
			<circle cx="30" cy="125" r="5" fill="#FCA5A5" stroke="#0F172A" stroke-width="2.5" />

			<ellipse cx="108" cy="176" rx="54" ry="8" fill="#0F172A" fill-opacity="0.14" />

			<path
				d="M88 150V168C88 171 84 173 79 173"
				stroke="#0F172A"
				stroke-width="5"
				stroke-linecap="round"
			/>
			<path
				d="M128 150V168C128 171 132 173 137 173"
				stroke="#0F172A"
				stroke-width="5"
				stroke-linecap="round"
			/>

			<path
				d="M62 110C48 112 44 126 54 132"
				stroke="#0F172A"
				stroke-width="5"
				stroke-linecap="round"
			/>
			<circle cx="54" cy="132" r="5.5" fill="#FDE047" stroke="#0F172A" stroke-width="3" />

			<g class="kudil-hand">
				<path
					d="M152 110C168 104 176 86 168 74"
					stroke="#0F172A"
					stroke-width="5"
					stroke-linecap="round"
				/>
				<circle cx="168" cy="74" r="6.5" fill="#FDE047" stroke="#0F172A" stroke-width="3" />
				<path
					d="M180 68C183 72 183 78 180 82"
					stroke="#162B52"
					stroke-width="2.5"
					stroke-linecap="round"
				/>
				<path
					d="M187 64C191 70 191 80 187 86"
					stroke="#7DD3FC"
					stroke-width="2.5"
					stroke-linecap="round"
				/>
			</g>

			<path
				d="M72 46C65 36 74 25 85 30L92 38"
				fill="#7DD3FC"
				stroke="#0F172A"
				stroke-width="3.5"
				stroke-linejoin="round"
			/>
			<path
				d="M144 46C151 36 142 25 131 30L124 38"
				fill="#FDE047"
				stroke="#0F172A"
				stroke-width="3.5"
				stroke-linejoin="round"
			/>
			<rect
				x="98"
				y="25"
				width="20"
				height="10"
				rx="5"
				fill="#162B52"
				stroke="#0F172A"
				stroke-width="3"
			/>

			<rect x="64" y="42" width="96" height="114" rx="28" fill="#0F172A" />
			<rect
				x="58"
				y="36"
				width="96"
				height="114"
				rx="28"
				fill="#162B52"
				stroke="#0F172A"
				stroke-width="4"
			/>

			<path d="M60 64H152" stroke="#0F172A" stroke-width="3.5" />
			<rect
				x="78"
				y="45"
				width="8"
				height="12"
				rx="4"
				fill="#FFFDF7"
				stroke="#0F172A"
				stroke-width="2.5"
			/>
			<rect
				x="126"
				y="45"
				width="8"
				height="12"
				rx="4"
				fill="#FFFDF7"
				stroke="#0F172A"
				stroke-width="2.5"
			/>

			<rect
				x="70"
				y="72"
				width="72"
				height="66"
				rx="18"
				fill="#FFFDF7"
				stroke="#0F172A"
				stroke-width="3.5"
			/>

			<circle cx="106" cy="80" r="2" fill="#162B52" />
			<circle cx="106" cy="130" r="2" fill="#162B52" />
			<circle cx="78" cy="105" r="2" fill="#162B52" />
			<circle cx="134" cy="105" r="2" fill="#162B52" />

			<circle cx="92" cy="100" r="4.8" fill="#0F172A" />
			<circle cx="93.5" cy="98.3" r="1.6" fill="#FFFFFF" />
			<circle cx="120" cy="100" r="4.8" fill="#0F172A" />
			<circle cx="121.5" cy="98.3" r="1.6" fill="#FFFFFF" />

			<ellipse cx="83" cy="109" rx="5.5" ry="3.5" fill="#FCA5A5" />
			<ellipse cx="129" cy="109" rx="5.5" ry="3.5" fill="#FCA5A5" />

			<path
				d="M97 111C100 118 112 118 115 111"
				stroke="#0F172A"
				stroke-width="3.5"
				stroke-linecap="round"
			/>

			<path
				d="M106 90V84M106 90L111 92"
				stroke="#1E3A8A"
				stroke-width="2.5"
				stroke-linecap="round"
			/>
		</svg>
	</div>
{/if}
